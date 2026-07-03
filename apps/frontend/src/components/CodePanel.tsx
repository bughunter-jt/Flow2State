import { WorkspacePanel } from "./WorkspacePanel";

type CodePanelProps = {
  className: string;
  kicker: string;
  title: string;
  content: string;
  fallback: string;
};

export function CodePanel({
  className,
  kicker,
  title,
  content,
  fallback,
}: CodePanelProps) {
  return (
    <WorkspacePanel className={className} kicker={kicker} title={title}>
      <pre className="code-block">{content || fallback}</pre>
    </WorkspacePanel>
  );
}
