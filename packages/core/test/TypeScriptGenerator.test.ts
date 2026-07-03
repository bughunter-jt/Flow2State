import { describe, expect, it } from "vitest";
import { TypeScriptGenerator } from "@/code-generator/generators/TypeScriptGenerator";
import { registry } from "@/code-generator/GeneratorRegistry";
import { authMachine } from "./auth-machine";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

describe("TypeScriptGenerator", () => {
  it("generates expected TypeScript machine output", () => {
    const generator = new TypeScriptGenerator();
    const output = generator.generate(authMachine);
    const normalized = normalize(output);

    expect(normalized).toContain("export const authflowMachine = {");
    expect(normalized).toContain('initial: "Login"');
    expect(normalized).toContain('success: "MFA"');
    expect(normalized).toContain('fail: "Error"');
    expect(normalized).toContain('verified: "Success"');
  });

  it("registers itself via decorator", () => {
    const result = registry.generate("typescript", authMachine);
    expect(normalize(result)).toContain('initial: "Login"');
  });

  it("renders final targets via an explicit sentinel constant", () => {
    const generator = new TypeScriptGenerator();
    const output = generator.generate({
      name: "Checkout",
      initialState: "Review",
      states: {
        Review: {
          name: "Review",
          transitions: [{ event: "confirm", target: { kind: "final" } }],
        },
      },
    });

    const normalized = normalize(output);

    expect(normalized).toContain(
      'export const FINAL_STATE = "__FINAL__" as const;',
    );
    expect(normalized).toContain("confirm: FINAL_STATE");
  });
});
