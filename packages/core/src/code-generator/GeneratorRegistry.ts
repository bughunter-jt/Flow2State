import { CodeGenerator } from "./code-generator";

export class GeneratorRegistry {
  private generators = new Map<string, CodeGenerator<any>>();

  register(generator: CodeGenerator<any>) {
    this.generators.set(generator.language, generator);
  }

  get(language: string) {
    const gen = this.generators.get(language);
    if (!gen) {
      throw new Error(`Generator not found: ${language}`);
    }
    return gen;
  }

  generate(language: string, machine: any) {
    const generator = this.get(language);
    return generator.generate(machine);
  }

  list() {
    return Array.from(this.generators.keys());
  }
}
export const registry = new GeneratorRegistry();
