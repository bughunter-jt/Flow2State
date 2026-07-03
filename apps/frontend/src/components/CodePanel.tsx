import type { ReactNode } from "react";
import { WorkspacePanel } from "./WorkspacePanel";

type CodePanelProps = {
  className: string;
  kicker: string;
  title: string;
  content: string;
  fallback: string;
  action?: ReactNode;
};

export function CodePanel({
  className,
  kicker,
  title,
  content,
  fallback,
  action,
}: CodePanelProps) {
  return (
    <WorkspacePanel
      className={className}
      kicker={kicker}
      title={title}
      action={action}
    >
      <pre className="code-block">{content || fallback}</pre>
    </WorkspacePanel>
  );
}
