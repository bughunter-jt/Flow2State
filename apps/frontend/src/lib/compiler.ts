import mermaid from "mermaid";
import { TypeScriptGenerator } from "@core/code-generator/generators/TypeScriptGenerator.ts";
import type { StateMachine } from "@core/ir/state-machine.ts";
import type { Diagnostic } from "@core/parser/diagnostic.ts";
import { MermaidStateDiagramParser } from "@core/parser/mermaid/MermaidStateDiagramParser.ts";

export const initialSource = `stateDiagram-v2
  [*] --> Checkout
  state Checkout {
    [*] --> Review
    Review -->|confirm| Payment
    Payment -->|approve| Complete
    Payment -->|cancel| [*]
  }
  state "Needs Manual Review" as ManualReview
  Checkout -->|fallback| "Needs Manual Review"
  ManualReview -->|resolve| Complete
`;

export type MachineComputation = {
  diagnostics: Diagnostic[];
  machine: StateMachine | null;
  generatedCode: string;
};

const parser = new MermaidStateDiagramParser();
const generator = new TypeScriptGenerator();

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  fontFamily: "Aptos, Segoe UI, sans-serif",
  themeVariables: {
    primaryColor: "#fcf3d6",
    primaryTextColor: "#251c13",
    primaryBorderColor: "#bc6c25",
    lineColor: "#5f3d26",
    tertiaryColor: "#fffaf0",
    clusterBkg: "#f6ead7",
    clusterBorder: "#a86a31",
  },
});

export function compileSource(source: string): MachineComputation {
  const parsed = parser.parseToIR(source, {
    machineName: "Flow2State",
  });

  return {
    diagnostics: parsed.diagnostics,
    machine: parsed.value,
    generatedCode: parsed.value ? generator.generate(parsed.value) : "",
  };
}

export function renderPreview(sourceId: string, machine: StateMachine) {
  return mermaid.render(sourceId, buildMermaidFromMachine(machine));
}

function buildMermaidFromMachine(machine: StateMachine): string {
  const lines = ["stateDiagram-v2", `  [*] --> ${machine.initialState}`];
  const containerStates = new Set<string>();

  for (const state of Object.values(machine.states)) {
    if (state.parentState) {
      containerStates.add(state.parentState);
    }
  }

  for (const stateName of Object.keys(machine.states)) {
    const state = machine.states[stateName];

    if (containerStates.has(stateName)) {
      lines.push(`  state ${stateName} {`);
      if (state.initialState) {
        lines.push(
          `    [*] --> ${stripParentPrefix(state.initialState, stateName)}`,
        );
      }

      for (const childState of Object.values(machine.states).filter(
        (candidate) => candidate.parentState === stateName,
      )) {
        for (const transition of childState.transitions) {
          lines.push(
            `    ${stripParentPrefix(childState.name, stateName)} -->|${transition.event}| ${formatMermaidTarget(transition, stateName)}`,
          );
        }
      }

      lines.push("  }");
      continue;
    }

    if (state.parentState) {
      continue;
    }

    for (const transition of state.transitions) {
      lines.push(
        `  ${state.name} -->|${transition.event}| ${formatMermaidTarget(transition)}`,
      );
    }
  }

  return lines.join("\n");
}

function formatMermaidTarget(
  transition: StateMachine["states"][string]["transitions"][number],
  containerState?: string,
): string {
  if (transition.target.kind === "final") {
    return "[*]";
  }

  return containerState
    ? stripParentPrefix(transition.target.stateName, containerState)
    : transition.target.stateName;
}

function stripParentPrefix(stateName: string, parentState: string): string {
  return stateName.startsWith(`${parentState}.`)
    ? stateName.slice(parentState.length + 1)
    : stateName;
}
