import {
  finalTarget,
  StateMachine,
  StateNode,
  stateTarget,
  Transition,
} from "../../ir/state-machine";
import { parserRegistry } from "../ParserRegistry";
import { Diagnostic } from "../diagnostic";
import {
  IRResult,
  ParseResult,
  ParseToIROptions,
  SyntaxAdapter,
} from "../syntax-adapter";
import {
  MermaidStateDeclarationAstNode,
  MermaidStateDiagramAst,
  MermaidTransitionAstNode,
} from "./mermaid-types";
import { validateStateMachine } from "../../validation/validate-state-machine";

const INITIAL_MARKER = "[*]";
const COMMENT_PREFIX = "%%";
const HEADER_PATTERN = /^stateDiagram(?:-v2)?$/;
const STATE_BLOCK_START_PATTERN = /^state\s+([A-Za-z_][\w-]*)\s*\{$/;
const STATE_ALIAS_PATTERN =
  /^state\s+("(?:[^"\\]|\\.)+"|[A-Za-z_][\w.-]*)\s+as\s+([A-Za-z_][\w-]*)$/;
const STATE_ALIAS_BLOCK_START_PATTERN =
  /^state\s+("(?:[^"\\]|\\.)+"|[A-Za-z_][\w.-]*)\s+as\s+([A-Za-z_][\w-]*)\s*\{$/;
const STATE_BLOCK_END_PATTERN = /^\}$/;

export class MermaidStateDiagramParser implements SyntaxAdapter<MermaidStateDiagramAst> {
  language = "mermaid";

  parse(source: string): ParseResult<MermaidStateDiagramAst> {
    const diagnostics: Diagnostic[] = [];
    const declarations: MermaidStateDeclarationAstNode[] = [];
    const transitions: MermaidTransitionAstNode[] = [];
    const lines = source.split(/\r?\n/);
    const scopeStack: string[] = [];
    const labelAliases = new Map<string, string>();
    let diagramType: MermaidStateDiagramAst["diagramType"] | null = null;

    for (const [index, rawLine] of lines.entries()) {
      const lineNumber = index + 1;
      const trimmed = rawLine.trim();

      if (!trimmed || trimmed.startsWith(COMMENT_PREFIX)) {
        continue;
      }

      if (!diagramType) {
        if (!HEADER_PATTERN.test(trimmed)) {
          diagnostics.push({
            code: "parser/invalid-header",
            message: 'Expected "stateDiagram" or "stateDiagram-v2" header.',
            severity: "error",
            location: { line: lineNumber, column: 1 },
          });

          continue;
        }

        diagramType = trimmed as MermaidStateDiagramAst["diagramType"];
        continue;
      }

      const aliasBlockStart = trimmed.match(STATE_ALIAS_BLOCK_START_PATTERN);
      if (aliasBlockStart) {
        const canonicalName = qualifyStateName(aliasBlockStart[2], scopeStack);
        registerLabelAlias(
          labelAliases,
          aliasBlockStart[1],
          canonicalName,
          scopeStack,
        );
        declarations.push({
          name: canonicalName,
          line: lineNumber,
          scope: [...scopeStack],
        });
        scopeStack.push(canonicalName);
        continue;
      }

      const aliasDeclaration = trimmed.match(STATE_ALIAS_PATTERN);
      if (aliasDeclaration) {
        const canonicalName = qualifyStateName(aliasDeclaration[2], scopeStack);
        registerLabelAlias(
          labelAliases,
          aliasDeclaration[1],
          canonicalName,
          scopeStack,
        );
        declarations.push({
          name: canonicalName,
          line: lineNumber,
          scope: [...scopeStack],
        });
        continue;
      }

      const blockStart = trimmed.match(STATE_BLOCK_START_PATTERN);
      if (blockStart) {
        const canonicalName = qualifyStateName(blockStart[1], scopeStack);
        declarations.push({
          name: canonicalName,
          line: lineNumber,
          scope: [...scopeStack],
        });
        scopeStack.push(canonicalName);
        continue;
      }

      if (STATE_BLOCK_END_PATTERN.test(trimmed)) {
        if (scopeStack.length === 0) {
          diagnostics.push({
            code: "parser/unmatched-block-end",
            message:
              "Found a closing state block without a matching opening block.",
            severity: "error",
            location: { line: lineNumber, column: 1 },
          });
          continue;
        }

        scopeStack.pop();
        continue;
      }

      const parsedTransition = parseTransitionLine(trimmed);
      if (!parsedTransition) {
        diagnostics.push({
          code: "parser/unsupported-line",
          message:
            "Only strict transition lines in the form A --> B or A -->|event| B are supported.",
          severity: "error",
          location: { line: lineNumber, column: 1 },
        });

        continue;
      }

      const { from, event, to } = parsedTransition;
      const resolvedFrom = resolveStateReference(
        from,
        scopeStack,
        labelAliases,
      );
      const resolvedTo = resolveStateReference(to, scopeStack, labelAliases);

      if (!resolvedFrom || !resolvedTo) {
        diagnostics.push({
          code: "parser/unresolved-state-reference",
          message:
            "Quoted state references must be declared with a Mermaid alias before use.",
          severity: "error",
          location: { line: lineNumber, column: 1 },
        });
        continue;
      }

      transitions.push({
        from: resolvedFrom,
        to: resolvedTo,
        event: event?.trim() || undefined,
        line: lineNumber,
        scope: [...scopeStack],
      });
    }

    if (scopeStack.length > 0) {
      diagnostics.push({
        code: "parser/unclosed-block",
        message: "State block was opened but not closed.",
        severity: "error",
        location: { line: lines.length, column: 1 },
      });
    }

    if (!diagramType) {
      diagnostics.push({
        code: "parser/missing-header",
        message:
          'Mermaid state diagrams must start with "stateDiagram" or "stateDiagram-v2".',
        severity: "error",
        location: { line: 1, column: 1 },
      });
    }

    return {
      ast:
        diagnostics.some((diagnostic) => diagnostic.severity === "error") ||
        !diagramType
          ? null
          : {
              diagramType,
              declarations,
              transitions,
            },
      diagnostics,
    };
  }

  toIR(
    ast: MermaidStateDiagramAst,
    options?: ParseToIROptions,
  ): IRResult<StateMachine> {
    const diagnostics: Diagnostic[] = [];
    const states = new Map<string, StateNode>();
    const initialTransitions = ast.transitions.filter(
      (transition) =>
        transition.from === INITIAL_MARKER && transition.scope.length === 0,
    );
    const scopedInitialTransitions = ast.transitions.filter(
      (transition) =>
        transition.from === INITIAL_MARKER && transition.scope.length > 0,
    );

    if (initialTransitions.length === 0) {
      diagnostics.push({
        code: "parser/missing-initial",
        message:
          "A Mermaid state diagram must define one initial transition: [*] --> State.",
        severity: "error",
      });
    }

    if (initialTransitions.length > 1) {
      for (const transition of initialTransitions.slice(1)) {
        diagnostics.push({
          code: "parser/multiple-initial",
          message: "Only one initial transition is supported.",
          severity: "error",
          location: { line: transition.line, column: 1 },
        });
      }
    }

    if (
      initialTransitions.some((transition) => transition.to === INITIAL_MARKER)
    ) {
      diagnostics.push({
        code: "parser/invalid-initial-target",
        message: "The initial transition must target a concrete state.",
        severity: "error",
      });
    }

    for (const transition of scopedInitialTransitions) {
      if (transition.to === INITIAL_MARKER) {
        diagnostics.push({
          code: "parser/invalid-scoped-initial-target",
          message:
            "A nested initial transition must target a concrete child state.",
          severity: "error",
          location: { line: transition.line, column: 1 },
        });
      }
    }

    const scopedInitialByContainer = new Map<
      string,
      MermaidTransitionAstNode
    >();
    for (const transition of scopedInitialTransitions) {
      const containerState = transition.scope[transition.scope.length - 1];
      const existing = scopedInitialByContainer.get(containerState);
      if (existing) {
        diagnostics.push({
          code: "parser/multiple-scoped-initial",
          message: `State "${containerState}" defines more than one nested initial transition.`,
          severity: "error",
          location: { line: transition.line, column: 1 },
        });
        continue;
      }

      scopedInitialByContainer.set(containerState, transition);
    }

    for (const declaration of ast.declarations) {
      ensureState(states, declaration.name);
    }

    for (const transition of ast.transitions) {
      if (transition.scope.length > 0) {
        for (const scopedStateName of transition.scope) {
          ensureState(states, scopedStateName);
        }
      }

      if (transition.to !== INITIAL_MARKER) {
        ensureState(states, transition.to);
      }

      if (transition.from === INITIAL_MARKER) {
        continue;
      }

      ensureState(states, transition.from).transitions.push(
        toTransition(transition),
      );
    }

    if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
      return { value: null, diagnostics };
    }

    for (const [containerState, transition] of scopedInitialByContainer) {
      ensureState(states, containerState).initialState = transition.to;
    }

    const initialState = initialTransitions[0].to;
    const machine: StateMachine = {
      name: options?.machineName ?? "StateMachine",
      initialState,
      states: Object.fromEntries(states.entries()),
    };
    const validationDiagnostics = validateStateMachine(machine);

    return {
      value: validationDiagnostics.some(
        (diagnostic) => diagnostic.severity === "error",
      )
        ? null
        : machine,
      diagnostics: [...diagnostics, ...validationDiagnostics],
    };
  }

  parseToIR(
    source: string,
    options?: ParseToIROptions,
  ): IRResult<StateMachine> {
    const parsed = this.parse(source);
    if (!parsed.ast) {
      return {
        value: null,
        diagnostics: parsed.diagnostics,
      };
    }

    const ir = this.toIR(parsed.ast, options);
    return {
      value: ir.value,
      diagnostics: [...parsed.diagnostics, ...ir.diagnostics],
    };
  }
}

function ensureState(
  states: Map<string, StateNode>,
  stateName: string,
): StateNode {
  const existing = states.get(stateName);
  if (existing) {
    return existing;
  }

  const parentState = getParentStateName(stateName);

  const created: StateNode = {
    name: stateName,
    parentState,
    transitions: [],
  };
  states.set(stateName, created);
  return created;
}

function toTransition(transition: MermaidTransitionAstNode): Transition {
  return {
    event: transition.event ?? "__AUTO__",
    target:
      transition.to === INITIAL_MARKER
        ? finalTarget()
        : stateTarget(transition.to),
  };
}

function qualifyStateName(stateName: string, scopeStack: string[]): string {
  if (stateName === INITIAL_MARKER || stateName.includes(".")) {
    return stateName;
  }

  return scopeStack.length > 0
    ? `${scopeStack[scopeStack.length - 1]}.${stateName}`
    : stateName;
}

function getParentStateName(stateName: string): string | undefined {
  const separatorIndex = stateName.lastIndexOf(".");
  if (separatorIndex === -1) {
    return undefined;
  }

  return stateName.slice(0, separatorIndex);
}

function parseTransitionLine(
  line: string,
): { from: string; event?: string; to: string } | null {
  const arrowIndex = line.indexOf("-->");
  if (arrowIndex === -1) {
    return null;
  }

  const from = line.slice(0, arrowIndex).trim();
  let remainder = line.slice(arrowIndex + 3).trim();
  let event: string | undefined;

  if (remainder.startsWith("|")) {
    const eventEnd = remainder.indexOf("|", 1);
    if (eventEnd === -1) {
      return null;
    }

    event = remainder.slice(1, eventEnd).trim();
    remainder = remainder.slice(eventEnd + 1).trim();
  }

  if (
    !isSupportedStateTokenSyntax(from) ||
    !isSupportedStateTokenSyntax(remainder)
  ) {
    return null;
  }

  return {
    from,
    event,
    to: remainder,
  };
}

function isSupportedStateTokenSyntax(token: string): boolean {
  return (
    token === INITIAL_MARKER ||
    isQuotedStateToken(token) ||
    /^[A-Za-z_][\w.-]*$/.test(token)
  );
}

function resolveStateReference(
  token: string,
  scopeStack: string[],
  labelAliases: Map<string, string>,
): string | null {
  if (token === INITIAL_MARKER) {
    return token;
  }

  if (isQuotedStateToken(token)) {
    return lookupLabelAlias(labelAliases, unquoteStateToken(token), scopeStack);
  }

  if (/^[A-Za-z_][\w.-]*$/.test(token)) {
    return qualifyStateName(token, scopeStack);
  }

  return null;
}

function registerLabelAlias(
  labelAliases: Map<string, string>,
  token: string,
  canonicalName: string,
  scopeStack: string[],
) {
  if (!isQuotedStateToken(token)) {
    return;
  }

  labelAliases.set(
    makeScopedLabelKey(unquoteStateToken(token), scopeStack),
    canonicalName,
  );
}

function lookupLabelAlias(
  labelAliases: Map<string, string>,
  label: string,
  scopeStack: string[],
): string | null {
  for (let index = scopeStack.length; index >= 0; index -= 1) {
    const scopedKey = makeScopedLabelKey(label, scopeStack.slice(0, index));
    const resolved = labelAliases.get(scopedKey);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function makeScopedLabelKey(label: string, scopeStack: string[]): string {
  return `${scopeStack.join(">")}:${label}`;
}

function isQuotedStateToken(token: string): boolean {
  return /^"(?:[^"\\]|\\.)+"$/.test(token);
}

function unquoteStateToken(token: string): string {
  return token.slice(1, -1);
}

parserRegistry.register("mermaid", new MermaidStateDiagramParser());
