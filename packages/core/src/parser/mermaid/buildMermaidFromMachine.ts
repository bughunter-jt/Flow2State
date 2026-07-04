import type { StateMachine } from "../../ir/state-machine.ts";

const AUTO_TRANSITION_EVENT = "__AUTO__";

export function buildMermaidFromMachine(machine: StateMachine): string {
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
            `    ${formatMermaidTransitionLine(
              stripParentPrefix(childState.name, stateName),
              transition,
              stateName,
            )}`,
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
      lines.push(`  ${formatMermaidTransitionLine(state.name, transition)}`);
    }
  }

  return lines.join("\n");
}

function formatMermaidTransitionLine(
  from: string,
  transition: StateMachine["states"][string]["transitions"][number],
  containerState?: string,
): string {
  const target = formatMermaidTarget(transition, containerState);

  if (!transition.event || transition.event === AUTO_TRANSITION_EVENT) {
    return `${from} --> ${target}`;
  }

  return `${from} --> ${target} : ${transition.event}`;
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
