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
    <article
      className={`grid min-h-0 gap-4 rounded-3xl border border-stone-800/10 bg-white/70 p-[18px] shadow-[0_18px_45px_rgba(75,44,18,0.08)] max-[720px]:p-4 ${className}`}
    >
      <div className="panel-header flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="panel-kicker text-[0.7rem] font-medium uppercase tracking-[0.18em] text-amber-700">
            {kicker}
          </p>
          <h2 className="truncate text-stone-900">{title}</h2>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
      {children}
    </article>
  );
}
