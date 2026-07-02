import { StateMachine } from "../ir/state-machine";
export interface GenerateOptions {
  indentSize?: number;
  strict?: boolean;
  includeTypes?: boolean;
}

export interface CodeGenerator<T = string> {
  language: string;

  generate(machine: StateMachine, options?: GenerateOptions): T;
}
