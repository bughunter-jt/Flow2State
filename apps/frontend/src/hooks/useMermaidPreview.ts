import { useEffect, useRef, useState } from "react";
import type { MachineComputation } from "../lib/compiler";
import { renderPreview } from "../lib/compiler";

export function useMermaidPreview(result: MachineComputation) {
  const [diagramSvg, setDiagramSvg] = useState("");
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const previewId = useRef(0);

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

  return {
    diagramSvg,
    diagramError,
  };
}
