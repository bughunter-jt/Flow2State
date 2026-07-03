import { registry } from "./GeneratorRegistry";
import type { CodeGenerator } from "./code-generator";

type Constructor<T = any> = new (...args: any[]) => T;

export function Generator(name: string) {
  return function <T extends CodeGenerator>(target: Constructor<T>) {
    registry.register(name, new target());
  };
}
