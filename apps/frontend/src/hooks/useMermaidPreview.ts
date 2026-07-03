import { useEffect, useRef, useState } from "react";
import type { MachineComputation } from "../lib/compiler";
import { renderPreview } from "../lib/compiler";

export type PreviewStatus = "idle" | "loading" | "ready" | "error";

export function useMermaidPreview(
  result: MachineComputation,
  isCompiling: boolean,
) {
  const [diagramSvg, setDiagramSvg] = useState("");
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const previewId = useRef(0);

  useEffect(() => {
    const activeId = previewId.current + 1;
    previewId.current = activeId;

    if (isCompiling) {
      setDiagramSvg("");
      setDiagramError(null);
      setStatus("loading");
      return;
    }

    if (!result.machine) {
      setDiagramSvg("");
      setDiagramError(
        result.diagnostics.length > 0
          ? "Resolve parser diagnostics to render the live preview."
          : null,
      );
      setStatus(result.diagnostics.length > 0 ? "error" : "idle");
      return;
    }

    setDiagramSvg("");
    setDiagramError(null);
    setStatus("loading");

    void renderPreview(`flow2state-preview-${activeId}`, result.machine)
      .then(({ svg }) => {
        if (previewId.current !== activeId) {
          return;
        }

        setDiagramSvg(svg);
        setDiagramError(null);
        setStatus("ready");
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
        setStatus("error");
      });
  }, [isCompiling, result]);

  return {
    diagramSvg,
    diagramError,
    status,
  };
}
