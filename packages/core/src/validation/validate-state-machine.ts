import { formatTarget, isFinalTarget, StateMachine } from "../ir/state-machine";
import { Diagnostic } from "../parser/diagnostic";

export function validateStateMachine(machine: StateMachine): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const stateEntries = Object.entries(machine.states);

  if (!machine.initialState) {
    diagnostics.push({
      code: "validation/missing-initial-state",
      message: "State machines must define an initial state.",
      severity: "error",
    });
  } else if (!machine.states[machine.initialState]) {
    diagnostics.push({
      code: "validation/unknown-initial-state",
      message: `Initial state \"${machine.initialState}\" is not defined in states.`,
      severity: "error",
    });
  }

  for (const [stateKey, state] of stateEntries) {
    if (state.name !== stateKey) {
      diagnostics.push({
        code: "validation/state-name-mismatch",
        message: `State key \"${stateKey}\" does not match node name \"${state.name}\".`,
        severity: "error",
      });
    }

    const seenEvents = new Set<string>();
    for (const transition of state.transitions) {
      if (
        !isFinalTarget(transition.target) &&
        !machine.states[transition.target.stateName]
      ) {
        diagnostics.push({
          code: "validation/unknown-transition-target",
          message: `Transition from \"${stateKey}\" points to undefined state \"${formatTarget(transition.target)}\".`,
          severity: "error",
        });
      }

      if (seenEvents.has(transition.event)) {
        diagnostics.push({
          code: "validation/duplicate-event",
          message: `State \"${stateKey}\" has duplicate event \"${transition.event}\".`,
          severity: "error",
        });
        continue;
      }

      seenEvents.add(transition.event);
    }
  }

  return diagnostics;
}
