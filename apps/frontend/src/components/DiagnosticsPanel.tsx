import type { Diagnostic } from "@core/parser/diagnostic.ts";
import { WorkspacePanel } from "./WorkspacePanel";

type DiagnosticsPanelProps = {
  diagnostics: Diagnostic[];
};

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  const errorCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  ).length;
  const warningCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning",
  ).length;
  const summaryLabel =
    diagnostics.length === 0
      ? "All clear"
      : `${diagnostics.length} issue${diagnostics.length === 1 ? "" : "s"}`;

  const severityStyles: Record<Diagnostic["severity"], string> = {
    error:
      "border-red-600/20 bg-red-600/8 text-red-900 [&_p]:text-red-900/85 [&_span]:text-red-900/75",
    warning:
      "border-amber-600/22 bg-amber-500/10 text-amber-900 [&_p]:text-amber-900/85 [&_span]:text-amber-900/75",
  };

  return (
    <WorkspacePanel
      className="panel-diagnostics min-[981px]:col-span-2"
      kicker="Validation"
      title="Diagnostics"
      action={
        <span className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border border-emerald-700/20 bg-emerald-700/8 px-3 py-1.5 text-[0.84rem] tracking-[0.01em] text-emerald-900">
          {summaryLabel}
        </span>
      }
    >
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-700/10 bg-[rgba(255,252,246,0.74)] px-[14px] py-3 max-[720px]:flex-col">
        <p className="max-w-[44ch] text-[0.93rem] text-stone-700">
          Parser and semantic issues land here before code generation becomes
          trustworthy.
        </p>
        <div
          className="flex flex-wrap justify-end gap-2 max-[720px]:justify-start"
          aria-label="Diagnostic counts"
        >
          <span className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border border-stone-700/15 bg-white/80 px-3 py-1.5 text-[0.84rem] tracking-[0.01em] text-stone-900">
            {errorCount} errors
          </span>
          <span className="inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border border-stone-700/15 bg-white/80 px-3 py-1.5 text-[0.84rem] tracking-[0.01em] text-stone-900">
            {warningCount} warnings
          </span>
        </div>
      </div>
      {diagnostics.length === 0 ? (
        <div className="grid min-h-40 place-items-center rounded-[18px] border border-stone-700/10 bg-[var(--surface-muted)] p-5 text-center text-sm font-medium tracking-[0.01em] text-emerald-900">
          No diagnostics. The current workflow is valid.
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {diagnostics.map((diagnostic, index) => (
            <li
              key={`${diagnostic.code}-${index}`}
              className={`rounded-[18px] border p-[14px_16px] shadow-sm ${severityStyles[diagnostic.severity]}`}
            >
              <div className="mb-2 flex items-start justify-between gap-3 text-stone-900">
                <strong className="font-semibold tracking-[0.01em]">
                  {diagnostic.code}
                </strong>
                {diagnostic.location ? (
                  <span className="text-xs uppercase tracking-[0.08em]">
                    L{diagnostic.location.line}:C{diagnostic.location.column}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-6">{diagnostic.message}</p>
            </li>
          ))}
        </ul>
      )}
    </WorkspacePanel>
  );
}
