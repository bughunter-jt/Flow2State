import type { PreviewStatus } from "../hooks/useMermaidPreview";
import { WorkspacePanel } from "./WorkspacePanel";

type PreviewPanelProps = {
  diagramSvg: string;
  diagramError: string | null;
  status: PreviewStatus;
};

export function PreviewPanel({
  diagramSvg,
  diagramError,
  status,
}: PreviewPanelProps) {
  const message =
    status === "loading"
      ? "Rendering preview from the latest IR..."
      : (diagramError ?? "Preview will appear after a valid parse.");

  return (
    <WorkspacePanel
      className="panel-preview"
      kicker="Preview"
      title="IR-driven live diagram"
    >
      {diagramSvg ? (
        <div
          className="diagram-surface"
          dangerouslySetInnerHTML={{ __html: diagramSvg }}
        />
      ) : (
        <div className="diagram-empty">
          <p>{message}</p>
        </div>
      )}
    </WorkspacePanel>
  );
}
