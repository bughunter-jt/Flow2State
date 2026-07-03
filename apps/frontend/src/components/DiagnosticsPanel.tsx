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

  return (
    <WorkspacePanel
      className="panel-diagnostics"
      kicker="Validation"
      title="Diagnostics"
      action={
        <span className="status-pill status-summary">{summaryLabel}</span>
      }
    >
      <div className="panel-toolbar">
        <p className="panel-note">
          Parser and semantic issues land here before code generation becomes
          trustworthy.
        </p>
        <div className="panel-metrics" aria-label="Diagnostic counts">
          <span>{errorCount} errors</span>
          <span>{warningCount} warnings</span>
        </div>
      </div>
      {diagnostics.length === 0 ? (
        <div className="empty-state success-state">
          No diagnostics. The current workflow is valid.
        </div>
      ) : (
        <ul className="diagnostic-list">
          {diagnostics.map((diagnostic, index) => (
            <li
              key={`${diagnostic.code}-${index}`}
              className={`diagnostic diagnostic-${diagnostic.severity}`}
            >
              <div className="diagnostic-topline">
                <strong>{diagnostic.code}</strong>
                {diagnostic.location ? (
                  <span>
                    L{diagnostic.location.line}:C{diagnostic.location.column}
                  </span>
                ) : null}
              </div>
              <p>{diagnostic.message}</p>
            </li>
          ))}
        </ul>
      )}
    </WorkspacePanel>
  );
}
