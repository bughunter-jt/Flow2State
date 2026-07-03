import { describe, expect, it } from "vitest";
import { MermaidStateDiagramParser } from "@/parser/mermaid/MermaidStateDiagramParser";
import { parserRegistry } from "@/parser/ParserRegistry";

describe("MermaidStateDiagramParser", () => {
  it("parses a strict Mermaid state diagram into IR", () => {
    const source = `
stateDiagram-v2
  [*] --> Login
  Login -->|success| MFA
  Login -->|fail| Error
  MFA -->|verified| Success
`;

    const parser = new MermaidStateDiagramParser();
    const result = parser.parseToIR(source, { machineName: "AuthFlow" });

    expect(result.diagnostics).toEqual([]);
    expect(result.value).toEqual({
      name: "AuthFlow",
      initialState: "Login",
      states: {
        Login: {
          name: "Login",
          transitions: [
            { event: "success", target: "MFA" },
            { event: "fail", target: "Error" },
          ],
        },
        MFA: {
          name: "MFA",
          transitions: [{ event: "verified", target: "Success" }],
        },
        Error: {
          name: "Error",
          transitions: [],
        },
        Success: {
          name: "Success",
          transitions: [],
        },
      },
    });
  });

  it("reports unsupported syntax with line information", () => {
    const source = `
stateDiagram-v2
  [*] --> Login
  state Login {
`;

    const parser = new MermaidStateDiagramParser();
    const result = parser.parseToIR(source);

    expect(result.value).toBeNull();
    expect(result.diagnostics).toContainEqual({
      code: "parser/unsupported-line",
      message:
        "Only strict transition lines in the form A --> B or A -->|event| B are supported.",
      severity: "error",
      location: { line: 4, column: 1 },
    });
  });

  it("registers itself in the parser registry", () => {
    const result = parserRegistry.parseToIR(
      "mermaid",
      `
stateDiagram
  [*] --> Idle
`,
      { machineName: "SimpleFlow" },
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.initialState).toBe("Idle");
    expect(result.value?.name).toBe("SimpleFlow");
  });
});
