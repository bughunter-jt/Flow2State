import { useState } from "react";
import { CodePanel } from "./components/CodePanel";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { EditorPanel } from "./components/EditorPanel";
import { HeroSection } from "./components/HeroSection";
import { PreviewPanel } from "./components/PreviewPanel";
import "./App.css";
import { useCompiler } from "./hooks/useCompiler";
import { useMermaidPreview } from "./hooks/useMermaidPreview";

function App() {
  const [showIr, setShowIr] = useState(false);
  const { source, setSource, result, isCompiling } = useCompiler();
  const { diagramSvg, diagramError, status } = useMermaidPreview(
    result,
    isCompiling,
  );

  const hasErrors = result.diagnostics.some(
    (diagnostic) => diagnostic.severity === "error",
  );

  return (
    <main className="app-shell">
      <HeroSection
        hasErrors={hasErrors}
        stateCount={
          result.machine ? Object.keys(result.machine.states).length : 0
        }
        diagnosticCount={result.diagnostics.length}
      />

      <section className="workspace-grid">
        <EditorPanel source={source} onSourceChange={setSource} />
        <PreviewPanel
          diagramSvg={diagramSvg}
          diagramError={diagramError}
          status={status}
        />
        <DiagnosticsPanel diagnostics={result.diagnostics} />
        <CodePanel
          className={`panel-code${showIr ? "" : " panel-code-wide"}`}
          kicker="Output"
          title="Generated TypeScript"
          content={result.generatedCode}
          fallback="// Valid output appears here after a successful parse."
          action={
            <button
              type="button"
              className="ghost-button"
              onClick={() => setShowIr((previous) => !previous)}
              aria-pressed={showIr}
            >
              {showIr ? "Hide IR" : "Show IR"}
            </button>
          }
        />
        {showIr ? (
          <CodePanel
            className="panel-ir"
            kicker="Source Of Truth"
            title="State machine IR"
            content={
              result.machine ? JSON.stringify(result.machine, null, 2) : ""
            }
            fallback={'{\n  "status": "awaiting-valid-machine"\n}'}
          />
        ) : null}
      </section>
    </main>
  );
}

export default App;
