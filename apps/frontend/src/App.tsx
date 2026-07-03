import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { CodePanel } from "./components/CodePanel";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { EditorPanel } from "./components/EditorPanel";
import { HeroSection } from "./components/HeroSection";
import { PreviewPanel } from "./components/PreviewPanel";
import {
  compileSource,
  type MachineComputation,
  renderPreview,
} from "./lib/compiler";
import "./App.css";
import { initialSource } from "./lib/compiler";

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
    const nextResult = compileSource(deferredSource);

    startTransition(() => {
      setResult(nextResult);
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

    void renderPreview(`flow2state-preview-${activeId}`, result.machine)
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
      <HeroSection
        hasErrors={hasErrors}
        stateCount={
          result.machine ? Object.keys(result.machine.states).length : 0
        }
        diagnosticCount={result.diagnostics.length}
      />

      <section className="workspace-grid">
        <EditorPanel source={source} onSourceChange={setSource} />
        <PreviewPanel diagramSvg={diagramSvg} diagramError={diagramError} />
        <DiagnosticsPanel diagnostics={result.diagnostics} />
        <CodePanel
          className="panel-code"
          kicker="Output"
          title="Generated TypeScript"
          content={result.generatedCode}
          fallback="// Valid output appears here after a successful parse."
        />
        <CodePanel
          className="panel-ir"
          kicker="Source Of Truth"
          title="State machine IR"
          content={
            result.machine ? JSON.stringify(result.machine, null, 2) : ""
          }
          fallback={'{\n  "status": "awaiting-valid-machine"\n}'}
        />
      </section>
    </main>
  );
}

export default App;
