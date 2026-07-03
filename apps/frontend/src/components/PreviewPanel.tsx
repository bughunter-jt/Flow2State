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
  const statusLabel =
    status === "ready"
      ? "Preview ready"
      : status === "loading"
        ? "Rendering"
        : status === "error"
          ? "Needs attention"
          : "Idle";

  const message =
    status === "loading"
      ? "Rendering preview from the latest IR..."
      : (diagramError ?? "Preview will appear after a valid parse.");

  return (
    <WorkspacePanel
      className="panel-preview"
      kicker="Preview"
      title="IR-driven live diagram"
      action={
        <span className={`status-pill status-${status}`}>{statusLabel}</span>
      }
    >
      <div className="panel-toolbar">
        <p className="panel-note">
          The SVG is rendered from validated IR, not directly from the source
          text.
        </p>
      </div>
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
