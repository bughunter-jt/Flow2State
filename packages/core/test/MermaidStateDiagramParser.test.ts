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
            { event: "success", target: { kind: "state", stateName: "MFA" } },
            { event: "fail", target: { kind: "state", stateName: "Error" } },
          ],
        },
        MFA: {
          name: "MFA",
          transitions: [
            {
              event: "verified",
              target: { kind: "state", stateName: "Success" },
            },
          ],
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
  note right of Login: unsupported
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

  it("flattens state blocks into qualified state names", () => {
    const source = `
stateDiagram-v2
  [*] --> Checkout.Review
  state Checkout {
    Review -->|confirm| Confirmed
    Confirmed -->|done| [*]
  }
`;

    const parser = new MermaidStateDiagramParser();
    const result = parser.parseToIR(source, { machineName: "CheckoutFlow" });

    expect(result.diagnostics).toEqual([]);
    expect(result.value).toEqual({
      name: "CheckoutFlow",
      initialState: "Checkout.Review",
      states: {
        Checkout: {
          name: "Checkout",
          transitions: [],
        },
        "Checkout.Review": {
          name: "Checkout.Review",
          parentState: "Checkout",
          transitions: [
            {
              event: "confirm",
              target: { kind: "state", stateName: "Checkout.Confirmed" },
            },
          ],
        },
        "Checkout.Confirmed": {
          name: "Checkout.Confirmed",
          parentState: "Checkout",
          transitions: [{ event: "done", target: { kind: "final" } }],
        },
      },
    });
  });

  it("maps nested local initial transitions onto container state metadata", () => {
    const source = `
stateDiagram-v2
  [*] --> Checkout
  state Checkout {
    [*] --> Review
    Review -->|confirm| Confirmed
  }
`;

    const parser = new MermaidStateDiagramParser();
    const result = parser.parseToIR(source, { machineName: "CheckoutFlow" });

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.initialState).toBe("Checkout");
    expect(result.value?.states.Checkout).toEqual({
      name: "Checkout",
      initialState: "Checkout.Review",
      transitions: [],
    });
    expect(result.value?.states["Checkout.Review"].parentState).toBe(
      "Checkout",
    );
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

  it("maps Mermaid final transitions into the IR", () => {
    const source = `
stateDiagram-v2
  [*] --> Login
  Login -->|cancel| [*]
`;

    const parser = new MermaidStateDiagramParser();
    const result = parser.parseToIR(source, { machineName: "ExitFlow" });

    expect(result.diagnostics).toEqual([]);
    expect(result.value?.states.Login.transitions).toEqual([
      { event: "cancel", target: { kind: "final" } },
    ]);
  });

  it("reports duplicate events through shared IR validation", () => {
    const source = `
stateDiagram-v2
  [*] --> Login
  Login -->|submit| MFA
  Login -->|submit| Error
  MFA -->|verified| Success
`;

    const parser = new MermaidStateDiagramParser();
    const result = parser.parseToIR(source, { machineName: "AuthFlow" });

    expect(result.value).toBeNull();
    expect(result.diagnostics).toContainEqual({
      code: "validation/duplicate-event",
      message: 'State "Login" has duplicate event "submit".',
      severity: "error",
    });
  });
});
