import type { PreviewStatus } from "../hooks/useMermaidPreview";
import { WorkspacePanel } from "./WorkspacePanel";

type PreviewPanelProps = {
  diagramSvg: string;
  diagramError: string | null;
  status: PreviewStatus;
};

export function PreviewPanel({
  diagramSvg,
  diagramError,
  status,
}: PreviewPanelProps) {
  const statusStyles: Record<PreviewStatus, string> = {
    ready: "border-emerald-700/20 bg-emerald-700/8 text-emerald-900",
    loading: "border-amber-700/25 bg-amber-700/10 text-amber-900",
    error: "border-red-700/20 bg-red-700/8 text-red-900",
    idle: "border-stone-700/15 bg-white/75 text-stone-700",
  };

  const helperStyles: Record<PreviewStatus, string> = {
    ready: "text-emerald-900/80",
    loading: "text-amber-900/80",
    error: "text-red-900/80",
    idle: "text-stone-700",
  };

  const statusLabel =
    status === "ready"
      ? "Preview ready"
      : status === "loading"
        ? "Rendering"
        : status === "error"
          ? "Needs attention"
          : "Idle";

  const message =
    status === "loading"
      ? "Rendering preview from the latest IR..."
      : (diagramError ?? "Preview will appear after a valid parse.");

  return (
    <WorkspacePanel
      className="panel-preview self-start min-[981px]:sticky min-[981px]:top-5"
      kicker="Preview"
      title="IR-driven live diagram"
      action={
        <span
          className={`inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[0.84rem] tracking-[0.01em] ${statusStyles[status]}`}
        >
          {statusLabel}
        </span>
      }
    >
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-stone-700/10 bg-[rgba(255,252,246,0.74)] px-[14px] py-3 max-[720px]:flex-col">
        <p className={`max-w-[44ch] text-sm leading-6 ${helperStyles[status]}`}>
          The SVG is rendered from validated IR, not directly from the source
          text.
        </p>
      </div>
      {diagramSvg ? (
        <div
          className="min-h-[620px] max-h-[620px] overflow-auto rounded-[18px] border border-stone-700/10 bg-[var(--surface-muted)] p-[18px] shadow-inner ring-1 ring-amber-700/10 [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: diagramSvg }}
        />
      ) : (
        <div
          className={`grid min-h-[620px] place-items-center rounded-[18px] border border-stone-700/10 border-dashed bg-[var(--surface-muted)] p-5 text-center text-sm font-medium ${helperStyles[status]}`}
        >
          <p className="leading-7 tracking-[0.01em]">{message}</p>
        </div>
      )}
    </WorkspacePanel>
  );
}
