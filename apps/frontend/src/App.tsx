import { useState } from "react";
import { CodePanel } from "./components/CodePanel";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { EditorPanel } from "./components/EditorPanel";
import { HeroSection } from "./components/HeroSection";
import { PreviewPanel } from "./components/PreviewPanel";
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
    <main className="app-shell grid gap-5">
      <HeroSection
        hasErrors={hasErrors}
        stateCount={
          result.machine ? Object.keys(result.machine.states).length : 0
        }
        diagnosticCount={result.diagnostics.length}
      />

      <section className="workspace-grid grid items-start gap-[18px] min-[981px]:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)]">
        <EditorPanel source={source} onSourceChange={setSource} />
        <PreviewPanel
          diagramSvg={diagramSvg}
          diagramError={diagramError}
          status={status}
        />
        <DiagnosticsPanel diagnostics={result.diagnostics} />
        <CodePanel
          className={`panel-code${showIr ? "" : " min-[981px]:col-span-2"}`}
          kicker="Output"
          title="Generated TypeScript"
          content={result.generatedCode}
          fallback="// Valid output appears here after a successful parse."
          contentClassName="ring-1 ring-amber-700/10 bg-gradient-to-b from-amber-50/80 to-amber-100/40 shadow-inner"
          action={
            <button
              type="button"
              className="cursor-pointer rounded-full border border-amber-700/35 bg-amber-700/10 px-3.5 py-2.5 text-stone-900 shadow-sm transition [font:inherit] hover:-translate-y-0.5 hover:border-amber-700 hover:bg-amber-700/15"
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
