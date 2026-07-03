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
  MermaidStateDiagramAst,
  MermaidTransitionAstNode,
} from "./mermaid-types";
import { validateStateMachine } from "../../validation/validate-state-machine";

const INITIAL_MARKER = "[*]";
const COMMENT_PREFIX = "%%";
const HEADER_PATTERN = /^stateDiagram(?:-v2)?$/;
const TRANSITION_PATTERN =
  /^(\[\*\]|[A-Za-z_][\w-]*)\s*-->\s*(?:\|([^|]+)\|\s*)?(\[\*\]|[A-Za-z_][\w-]*)$/;

export class MermaidStateDiagramParser implements SyntaxAdapter<MermaidStateDiagramAst> {
  language = "mermaid";

  parse(source: string): ParseResult<MermaidStateDiagramAst> {
    const diagnostics: Diagnostic[] = [];
    const transitions: MermaidTransitionAstNode[] = [];
    const lines = source.split(/\r?\n/);
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

      const match = trimmed.match(TRANSITION_PATTERN);
      if (!match) {
        diagnostics.push({
          code: "parser/unsupported-line",
          message:
            "Only strict transition lines in the form A --> B or A -->|event| B are supported.",
          severity: "error",
          location: { line: lineNumber, column: 1 },
        });

        continue;
      }

      const [, from, event, to] = match;
      transitions.push({
        from,
        to,
        event: event?.trim() || undefined,
        line: lineNumber,
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
      (transition) => transition.from === INITIAL_MARKER,
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

    for (const transition of ast.transitions) {
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

  const created: StateNode = {
    name: stateName,
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

parserRegistry.register("mermaid", new MermaidStateDiagramParser());
