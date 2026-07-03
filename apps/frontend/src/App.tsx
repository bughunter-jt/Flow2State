import mermaid from "mermaid";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { TypeScriptGenerator } from "@core/code-generator/generators/TypeScriptGenerator.ts";
import type { Diagnostic } from "@core/parser/diagnostic.ts";
import { MermaidStateDiagramParser } from "@core/parser/mermaid/MermaidStateDiagramParser.ts";
import type { StateMachine } from "@core/ir/state-machine.ts";
import "./App.css";

const initialSource = `stateDiagram-v2
  [*] --> Checkout
  state Checkout {
    [*] --> Review
    Review -->|confirm| Payment
    Payment -->|approve| Complete
    Payment -->|cancel| [*]
  }
  state "Needs Manual Review" as ManualReview
  Checkout -->|fallback| "Needs Manual Review"
  ManualReview -->|resolve| Complete
`;

const parser = new MermaidStateDiagramParser();
const generator = new TypeScriptGenerator();

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  fontFamily: "Aptos, Segoe UI, sans-serif",
  themeVariables: {
    primaryColor: "#fcf3d6",
    primaryTextColor: "#251c13",
    primaryBorderColor: "#bc6c25",
    lineColor: "#5f3d26",
    tertiaryColor: "#fffaf0",
    clusterBkg: "#f6ead7",
    clusterBorder: "#a86a31",
  },
});

type MachineComputation = {
  diagnostics: Diagnostic[];
  machine: StateMachine | null;
  generatedCode: string;
};

function App() {
  const [source, setSource] = useState(initialSource);
  const deferredSource = useDeferredValue(source);
  const [result, setResult] = useState<MachineComputation>({
    diagnostics: [],
    machine: null,
    generatedCode: "",
  });
  const [diagramSvg, setDiagramSvg] = useState("");
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const previewId = useRef(0);

  useEffect(() => {
    const parsed = parser.parseToIR(deferredSource, {
      machineName: "Flow2State",
    });

    startTransition(() => {
      setResult({
        diagnostics: parsed.diagnostics,
        machine: parsed.value,
        generatedCode: parsed.value ? generator.generate(parsed.value) : "",
      });
    });
  }, [deferredSource]);

  useEffect(() => {
    const activeId = previewId.current + 1;
    previewId.current = activeId;

    if (!result.machine) {
      setDiagramSvg("");
      setDiagramError(
        result.diagnostics.length > 0
          ? "Resolve parser diagnostics to render the live preview."
          : null,
      );
      return;
    }

    const previewSource = buildMermaidFromMachine(result.machine);

    void mermaid
      .render(`flow2state-preview-${activeId}`, previewSource)
      .then(({ svg }) => {
        if (previewId.current !== activeId) {
          return;
        }

        setDiagramSvg(svg);
        setDiagramError(null);
      })
      .catch((error: unknown) => {
        if (previewId.current !== activeId) {
          return;
        }

        setDiagramSvg("");
        setDiagramError(
          error instanceof Error
            ? error.message
            : "Mermaid preview failed to render.",
        );
      });
  }, [result]);

  const hasErrors = result.diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );

  return (
    <main className="app-shell">
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">Flow2State Compiler</p>
          <h1>
            Design a workflow, inspect the IR, ship executable TypeScript.
          </h1>
          <p className="hero-text">
            The editor drives the compiler core directly. Every change reparses
            the Mermaid subset, validates the IR, regenerates the machine, and
            redraws the preview from the IR.
          </p>
        </div>
        <div className="hero-stats" aria-label="Compiler summary">
          <article>
            <span>Parser</span>
            <strong>{hasErrors ? "Blocked" : "Live"}</strong>
          </article>
          <article>
            <span>States</span>
            <strong>
              {result.machine ? Object.keys(result.machine.states).length : 0}
            </strong>
          </article>
          <article>
            <span>Diagnostics</span>
            <strong>{result.diagnostics.length}</strong>
          </article>
        </div>
      </section>

      <section className="workspace-grid">
        <article className="panel panel-editor">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Input</p>
              <h2>Mermaid authoring surface</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setSource(initialSource)}
            >
              Reset sample
            </button>
          </div>
          <textarea
            className="editor"
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            aria-label="Mermaid source editor"
          />
        </article>

        <article className="panel panel-preview">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Preview</p>
              <h2>IR-driven live diagram</h2>
            </div>
          </div>
          {diagramSvg ? (
            <div
              className="diagram-surface"
              dangerouslySetInnerHTML={{ __html: diagramSvg }}
            />
          ) : (
            <div className="diagram-empty">
              <p>
                {diagramError ?? "Preview will appear after a valid parse."}
              </p>
            </div>
          )}
        </article>

        <article className="panel panel-diagnostics">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Validation</p>
              <h2>Diagnostics</h2>
            </div>
          </div>
          {result.diagnostics.length === 0 ? (
            <div className="empty-state success-state">
              No diagnostics. The current workflow is valid.
            </div>
          ) : (
            <ul className="diagnostic-list">
              {result.diagnostics.map((diagnostic, index) => (
                <li
                  key={`${diagnostic.code}-${index}`}
                  className={`diagnostic diagnostic-${diagnostic.severity}`}
                >
                  <div className="diagnostic-topline">
                    <strong>{diagnostic.code}</strong>
                    {diagnostic.location ? (
                      <span>
                        L{diagnostic.location.line}:C
                        {diagnostic.location.column}
                      </span>
                    ) : null}
                  </div>
                  <p>{diagnostic.message}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel panel-code">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Output</p>
              <h2>Generated TypeScript</h2>
            </div>
          </div>
          <pre className="code-block">
            {result.generatedCode ||
              "// Valid output appears here after a successful parse."}
          </pre>
        </article>

        <article className="panel panel-ir">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Source Of Truth</p>
              <h2>State machine IR</h2>
            </div>
          </div>
          <pre className="code-block">
            {result.machine
              ? JSON.stringify(result.machine, null, 2)
              : '{\n  "status": "awaiting-valid-machine"\n}'}
          </pre>
        </article>
      </section>
    </main>
  );
}

function buildMermaidFromMachine(machine: StateMachine): string {
  const lines = ["stateDiagram-v2", `  [*] --> ${machine.initialState}`];
  const containerStates = new Set<string>();

  for (const state of Object.values(machine.states)) {
    if (state.parentState) {
      containerStates.add(state.parentState);
    }
  }

  for (const stateName of Object.keys(machine.states)) {
    const state = machine.states[stateName];

    if (containerStates.has(stateName)) {
      lines.push(`  state ${stateName} {`);
      if (state.initialState) {
        lines.push(
          `    [*] --> ${stripParentPrefix(state.initialState, stateName)}`,
        );
      }

      for (const childState of Object.values(machine.states).filter(
        (candidate) => candidate.parentState === stateName,
      )) {
        for (const transition of childState.transitions) {
          lines.push(
            `    ${stripParentPrefix(childState.name, stateName)} -->|${transition.event}| ${formatMermaidTarget(transition, stateName)}`,
          );
        }
      }

      lines.push("  }");
      continue;
    }

    if (state.parentState) {
      continue;
    }

    for (const transition of state.transitions) {
      lines.push(
        `  ${state.name} -->|${transition.event}| ${formatMermaidTarget(transition)}`,
      );
    }
  }

  return lines.join("\n");
}

function formatMermaidTarget(
  transition: StateMachine["states"][string]["transitions"][number],
  containerState?: string,
): string {
  if (transition.target.kind === "final") {
    return "[*]";
  }

  return containerState
    ? stripParentPrefix(transition.target.stateName, containerState)
    : transition.target.stateName;
}

function stripParentPrefix(stateName: string, parentState: string): string {
  return stateName.startsWith(`${parentState}.`)
    ? stateName.slice(parentState.length + 1)
    : stateName;
}

export default App;
