1. Product Overview
   1.1 Product Definition
   A developer-focused workflow compiler that takes Mermaid DSL as input, transforms it into an Intermediate Representation (IR), and generates TypeScript state machine code along with a live diagram preview based on that IR.

1.2 Core Value (MVP)
Define state machines "without code."

Generate immediately executable TypeScript code.

Verify structure via live diagram.

Prevent structural errors (eliminate invalid flows).

1.3 Core Principles
❗ AI / Git / backend generation are out of scope for the MVP.

❗ The MVP is strictly focused on a "deterministic compiler."

2. System Architecture
   2.1 Architecture
   Mermaid DSL (input)
   ↓
   Parser (strict grammar)
   ↓
   IR / AST (State Machine Core)
   ↓
   | Renderer | TS Generator |
   ↓
   Live Preview + Copy Output

2.2 Source of Truth
Primary: IR (State Machine Core)

DSL: Input layer only

Output: Derived products

3. Key Features
   3.1 🔥 Feature 1: Mermaid → IR Transformation Engine
   Description: Converts Mermaid DSL into a structured State Machine IR.

Current Mermaid subset for the MVP:

- Required header: `stateDiagram` or `stateDiagram-v2`
- Transition forms: `A --> B`, `A -->|event| B`, `A --> [*]`, `A -->|event| [*]`
- Initial transitions: one top-level `[*] --> State` is required
- State blocks: `state Parent { ... }`
- Nested local initial transitions inside blocks: `state Parent { [*] --> Child }`
- Alias declarations: `state "Human Label" as InternalName`
- Quoted references: `"Human Label" -->|event| OtherState` after alias declaration
- Comments: lines starting with `%%`

Current Mermaid subset limitations for the MVP:

- The compiler accepts a strict subset of Mermaid state syntax, not the full Mermaid grammar.
- Quoted state references must be declared through `state "Label" as Alias` before use.
- Nested states are flattened into qualified IR names such as `Checkout.Review`.
- A nested local initial transition is represented on the parent state as `initialState` metadata.
- Unsupported Mermaid constructs must fail deterministically with parser diagnostics.

Data Structure:

JSON
{
"initial": "Login",
"states": {
"Login": {
"name": "Login",
"on": {
"success": "MFA",
"fail": "Error"
}
},
"MFA": {
"name": "MFA",
"on": {
"verified": "Success"
}
}
}
}
Role: Structural validation, ensuring state consistency, and preventing invalid transitions.

3.2 ⚡ Feature 2: IR → TypeScript State Machine Generator
Description: Transpiles the IR into executable production-ready code.

Output:

TypeScript
export const FINAL_STATE = "**FINAL**" as const;

const machine = {
initial: "Login",
states: {
Login: {
on: {
success: "MFA",
fail: "Error"
}
},
MFA: {
on: {
verified: "Success"
}
}
}
};
Final transitions must be emitted as `FINAL_STATE`, not `null`.

Nested container states must preserve their local initial state in generated output:

TypeScript
const nestedMachine = {
initial: "Checkout",
states: {
Checkout: {
initial: "Checkout.Review",
on: {}
},
"Checkout.Review": {
on: {
confirm: "Checkout.Confirmed"
}
}
}
};
Value: Instant code readiness, elimination of complex switch-case blocks, and reduction of state-related bugs.

3.3 👁 Feature 3: Live Diagram Preview (Sync UI)
Description: Real-time rendering of the Mermaid input into a visual diagram.

UI Layout:

Plaintext
+------------------------+------------------------+
| Mermaid Editor | Live Diagram |
|------------------------|------------------------|
| Login --> MFA | Login → MFA |
| MFA --> Success | ↓ |
+------------------------+------------------------+
Characteristics: 100~300ms debounce, instant feedback, IR-based synchronization.

4. IR Design (Core Extension Point)
   IR Structure
   TypeScript
   type Machine = {
   initial: string;
   states: Record<string, {
   name: string;
   parentState?: string;
   initialState?: string;
   on?: Record<string, string | typeof FINAL_STATE>;
   }>;
   };
   IR Role
   The single source of truth for all modules.

Shared input for both the renderer and the code generator.

Defined as the primary extension point for future AI/Git integrations.
