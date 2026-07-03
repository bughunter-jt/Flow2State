import type { PropsWithChildren, ReactNode } from "react";

type WorkspacePanelProps = PropsWithChildren<{
  className: string;
  kicker: string;
  title: string;
  action?: ReactNode;
}>;

export function WorkspacePanel({
  className,
  kicker,
  title,
  action,
  children,
}: WorkspacePanelProps) {
  return (
    <article className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <p className="panel-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}
