import type { ReactNode } from "react";
import { WorkspacePanel } from "./WorkspacePanel";

type CodePanelProps = {
  className: string;
  kicker: string;
  title: string;
  content: string;
  fallback: string;
  action?: ReactNode;
  contentClassName?: string;
};

export function CodePanel({
  className,
  kicker,
  title,
  content,
  fallback,
  action,
  contentClassName,
}: CodePanelProps) {
  return (
    <WorkspacePanel
      className={className}
      kicker={kicker}
      title={title}
      action={action}
    >
      <pre
        className={`m-0 min-h-[260px] overflow-auto whitespace-pre-wrap break-words rounded-[18px] border border-stone-700/10 bg-[var(--surface-muted)] p-4 text-stone-900 [font:0.92rem/1.65_var(--mono)] ${contentClassName ?? ""}`}
      >
        {content || fallback}
      </pre>
    </WorkspacePanel>
  );
}
