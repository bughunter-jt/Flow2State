import type { Diagnostic } from "@core/parser/diagnostic.ts";
import { WorkspacePanel } from "./WorkspacePanel";

type DiagnosticsPanelProps = {
  diagnostics: Diagnostic[];
};

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  return (
    <WorkspacePanel
      className="panel-diagnostics"
      kicker="Validation"
      title="Diagnostics"
    >
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
