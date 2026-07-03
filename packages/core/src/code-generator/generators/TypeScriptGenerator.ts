import { Generator } from "../generator.decorator";
import { CodeGenerator, GenerateOptions } from "../code-generator";
import { isFinalTarget, StateMachine } from "../../ir/state-machine";

@Generator("typescript")
export class TypeScriptGenerator implements CodeGenerator<string> {
  language = "typescript";

  generate(machine: StateMachine, options?: GenerateOptions): string {
    const states = Object.entries(machine.states)
      .map(([stateName, state]) => {
        const transitions = state.transitions
          .map((t) =>
            isFinalTarget(t.target)
              ? `        ${t.event}: null`
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
export const ${machine.name.toLowerCase()}Machine = {
  initial: "${machine.initialState}",
  states: {${states}
  }
} as const;
`;
  }
}
