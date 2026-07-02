import { registry } from "./src/code-generator/GeneratorRegistry";
import "./src/code-generator/generators/TypeScriptGenerator";
import { authMachine } from "./test/auth-machine";

const generatedCode = registry.generate("typescript", authMachine);
console.log(generatedCode);
