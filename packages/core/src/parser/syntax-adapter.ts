import type { StateMachine } from "../ir/state-machine";
import type { Diagnostic } from "./diagnostic";

export interface ParseResult<TAst> {
  ast: TAst | null;
  diagnostics: Diagnostic[];
}

export interface IRResult<T> {
  value: T | null;
  diagnostics: Diagnostic[];
}

export interface ParseToIROptions {
  machineName?: string;
}

export interface SyntaxAdapter<TAst> {
  language: string;

  parse(source: string): ParseResult<TAst>;
  toIR(ast: TAst, options?: ParseToIROptions): IRResult<StateMachine>;
  parseToIR(source: string, options?: ParseToIROptions): IRResult<StateMachine>;
}
