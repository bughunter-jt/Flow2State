import mermaid from "mermaid";
import { TypeScriptGenerator } from "@core/code-generator/generators/TypeScriptGenerator.ts";
import type { StateMachine } from "@core/ir/state-machine.ts";
import type { Diagnostic } from "@core/parser/diagnostic.ts";
import { buildMermaidFromMachine } from "@core/parser/mermaid/buildMermaidFromMachine.ts";
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

export const SOURCE_STORAGE_KEY = "flow2state.source";

export const sourceTemplates = [
  {
    id: "checkout",
    label: "Checkout",
    source: initialSource,
  },
  {
    id: "approval",
    label: "Approval",
    source: `stateDiagram-v2
  [*] --> Draft
  Draft -->|submit| PendingReview
  PendingReview -->|approve| Approved
  PendingReview -->|reject| ChangesRequested
  ChangesRequested -->|revise| Draft
  Approved --> [*]
`,
  },
  {
    id: "retry",
    label: "Retry Flow",
    source: `stateDiagram-v2
  [*] --> Idle
  Idle -->|run| Processing
  Processing -->|success| Done
  Processing -->|fail| Retrying
  Retrying -->|retry_ok| Processing
  Retrying -->|give_up| Failed
  Done --> [*]
  Failed --> [*]
`,
  },
] as const;

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
