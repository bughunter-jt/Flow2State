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
      className="panel-editor min-[981px]:col-start-1"
      kicker="Input"
      title="Mermaid authoring surface"
      action={
        <button
          type="button"
          className="cursor-pointer rounded-full border border-amber-700/35 bg-amber-700/10 px-3.5 py-2.5 text-stone-900 shadow-sm transition [font:inherit] hover:-translate-y-0.5 hover:border-amber-700 hover:bg-amber-700/15"
          onClick={() => onSourceChange(initialSource)}
        >
          Reset sample
        </button>
      }
    >
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-700/10 bg-white/70 px-[14px] py-3 max-[720px]:flex-col">
        <p className="max-w-[44ch] text-sm leading-6 text-stone-700">
          Author a compact Mermaid subset, then inspect the compiler output in
          real time.
        </p>
        <div
          className="flex flex-wrap justify-end gap-2 max-[720px]:justify-start"
          aria-label="Editor stats"
        >
          <span className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border border-stone-700/15 bg-white/80 px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-stone-800">
            {lineCount} lines
          </span>
          <span className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border border-stone-700/15 bg-white/80 px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-stone-800">
            {charCount} chars
          </span>
        </div>
      </div>
      <textarea
        className="box-border min-h-[620px] w-full resize-y rounded-[18px] border border-stone-700/10 bg-white/80 p-[18px] text-stone-900 outline-none shadow-inner transition-[border-color,box-shadow] duration-180 [font:0.96rem/1.65_var(--mono)] focus:border-amber-700 focus:shadow-[0_0_0_4px_rgba(188,108,37,0.12)] max-[980px]:min-h-[420px]"
        spellCheck={false}
        value={source}
        onChange={(event) => onSourceChange(event.target.value)}
        aria-label="Mermaid source editor"
      />
    </WorkspacePanel>
  );
}
