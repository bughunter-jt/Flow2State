import type { StateMachine } from "../ir/state-machine";
import type {
  IRResult,
  ParseToIROptions,
  SyntaxAdapter,
} from "./syntax-adapter";

export class ParserRegistry {
  private readonly map = new Map<string, SyntaxAdapter<unknown>>();

  register<TAst>(name: string, parser: SyntaxAdapter<TAst>) {
    this.map.set(name, parser as SyntaxAdapter<unknown>);
  }

  get(name: string) {
    return this.map.get(name);
  }

  list() {
    return [...this.map.keys()];
  }

  parseToIR(
    name: string,
    source: string,
    options?: ParseToIROptions,
  ): IRResult<StateMachine> {
    const parser = this.get(name);
    if (!parser) {
      return {
        value: null,
        diagnostics: [
          {
            code: "parser/not-found",
            message: `No parser: ${name}`,
            severity: "error",
          },
        ],
      };
    }

    return parser.parseToIR(source, options);
  }
}

export const parserRegistry = new ParserRegistry();
