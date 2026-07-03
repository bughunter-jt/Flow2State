import { initialSource } from "../lib/compiler";
import { WorkspacePanel } from "./WorkspacePanel";

type EditorPanelProps = {
  source: string;
  onSourceChange: (nextSource: string) => void;
};

export function EditorPanel({ source, onSourceChange }: EditorPanelProps) {
  const lineCount = source.split(/\r?\n/).length;
  const charCount = source.length;

  return (
    <WorkspacePanel
      className="panel-editor"
      kicker="Input"
      title="Mermaid authoring surface"
      action={
        <button
          type="button"
          className="ghost-button"
          onClick={() => onSourceChange(initialSource)}
        >
          Reset sample
        </button>
      }
    >
      <div className="panel-toolbar">
        <p className="panel-note">
          Author a compact Mermaid subset, then inspect the compiler output in
          real time.
        </p>
        <div className="panel-metrics" aria-label="Editor stats">
          <span>{lineCount} lines</span>
          <span>{charCount} chars</span>
        </div>
      </div>
      <textarea
        className="editor"
        spellCheck={false}
        value={source}
        onChange={(event) => onSourceChange(event.target.value)}
        aria-label="Mermaid source editor"
      />
    </WorkspacePanel>
  );
}
