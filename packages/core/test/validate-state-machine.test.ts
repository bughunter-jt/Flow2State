import { describe, expect, it } from "vitest";
import { StateMachine } from "@/ir/state-machine";
import { validateStateMachine } from "@/validation/validate-state-machine";

describe("validateStateMachine", () => {
  it("accepts a valid state machine", () => {
    const machine: StateMachine = {
      name: "AuthFlow",
      initialState: "Login",
      states: {
        Login: {
          name: "Login",
          transitions: [{ event: "success", target: "Success" }],
        },
        Success: {
          name: "Success",
          transitions: [],
        },
      },
    };

    expect(validateStateMachine(machine)).toEqual([]);
  });

  it("reports IR semantic violations", () => {
    const machine: StateMachine = {
      name: "BrokenFlow",
      initialState: "Missing",
      states: {
        Login: {
          name: "LOGIN",
          transitions: [
            { event: "success", target: "Success" },
            { event: "success", target: "AlsoMissing" },
          ],
        },
      },
    };

    expect(validateStateMachine(machine)).toEqual([
      {
        code: "validation/unknown-initial-state",
        message: 'Initial state "Missing" is not defined in states.',
        severity: "error",
      },
      {
        code: "validation/state-name-mismatch",
        message: 'State key "Login" does not match node name "LOGIN".',
        severity: "error",
      },
      {
        code: "validation/unknown-transition-target",
        message: 'Transition from "Login" points to undefined state "Success".',
        severity: "error",
      },
      {
        code: "validation/unknown-transition-target",
        message:
          'Transition from "Login" points to undefined state "AlsoMissing".',
        severity: "error",
      },
      {
        code: "validation/duplicate-event",
        message: 'State "Login" has duplicate event "success".',
        severity: "error",
      },
    ]);
  });
});
