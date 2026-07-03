import { initialSource } from "../lib/compiler";
import { WorkspacePanel } from "./WorkspacePanel";

type EditorPanelProps = {
  source: string;
  onSourceChange: (nextSource: string) => void;
};

export function EditorPanel({ source, onSourceChange }: EditorPanelProps) {
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
