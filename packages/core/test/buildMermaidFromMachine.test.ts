import { describe, expect, it } from "vitest";
import { buildMermaidFromMachine } from "@/parser/mermaid/buildMermaidFromMachine";
import { MermaidStateDiagramParser } from "@/parser/mermaid/MermaidStateDiagramParser";

describe("buildMermaidFromMachine", () => {
  it("renders transition labels with colon syntax instead of pipe syntax", () => {
    const source = `stateDiagram-v2
  [*] --> Checkout
  state Checkout {
    [*] --> Review
    Review -->|confirm| Payment
    Payment -->|approve| Complete
    Payment -->|cancel| [*]
  }`;

    const machine = new MermaidStateDiagramParser().parseToIR(source, {
      machineName: "Flow2State",
    }).value;

    expect(machine).not.toBeNull();

    const rendered = buildMermaidFromMachine(machine!);

    expect(rendered).toContain("Review --> Payment : confirm");
    expect(rendered).not.toContain("-->|confirm|");
    expect(rendered).not.toContain("-->|approve|");
  });
});
