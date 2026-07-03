import { WorkspacePanel } from "./WorkspacePanel";

type PreviewPanelProps = {
  diagramSvg: string;
  diagramError: string | null;
};

export function PreviewPanel({ diagramSvg, diagramError }: PreviewPanelProps) {
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
          <p>{diagramError ?? "Preview will appear after a valid parse."}</p>
        </div>
      )}
    </WorkspacePanel>
  );
}
