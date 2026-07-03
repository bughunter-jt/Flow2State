import { Generator } from "../generator.decorator";
import { CodeGenerator, GenerateOptions } from "../code-generator";
import { isFinalTarget, StateMachine } from "../../ir/state-machine";

@Generator("typescript")
export class TypeScriptGenerator implements CodeGenerator<string> {
  language = "typescript";

  generate(machine: StateMachine, options?: GenerateOptions): string {
    const usesFinalTarget = Object.values(machine.states).some((state) =>
      state.transitions.some((transition) => isFinalTarget(transition.target)),
    );

    const states = Object.entries(machine.states)
      .map(([stateName, state]) => {
        const transitions = state.transitions
          .map((t) =>
            isFinalTarget(t.target)
              ? `        ${t.event}: FINAL_STATE`
              : `        ${t.event}: "${t.target.stateName}"`,
          )
          .join(",\n");

        return `
    ${stateName}: {
      on: {
${transitions}
      }
    }`;
      })
      .join(",\n");

    return `
${usesFinalTarget ? 'export const FINAL_STATE = "__FINAL__" as const;\n' : ""}export const ${machine.name.toLowerCase()}Machine = {
  initial: "${machine.initialState}",
  states: {${states}
  }
} as const;
`;
  }
}
