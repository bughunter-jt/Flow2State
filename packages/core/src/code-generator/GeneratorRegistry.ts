import { CodeGenerator } from "./code-generator";

export class GeneratorRegistry {
  private map = new Map<string, CodeGenerator>();

  register(name: string, generator: CodeGenerator) {
    this.map.set(name, generator);
  }

  get(name: string) {
    return this.map.get(name);
  }

  list() {
    return [...this.map.keys()];
  }

  generate(name: string, machine: any) {
    const gen = this.get(name);
    if (!gen) throw new Error(`No generator: ${name}`);
    return gen.generate(machine);
  }
}

export const registry = new GeneratorRegistry();
