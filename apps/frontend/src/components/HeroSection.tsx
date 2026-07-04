type HeroSectionProps = {
  hasErrors: boolean;
  stateCount: number;
  diagnosticCount: number;
};

const statCardClassName =
  "flex items-baseline px-4 py-3 bg-gradient-to-b from-amber-50/90 to-amber-100/70 max-[720px]:px-4 max-[720px]:py-3";

const statLabelClassName =
  "w-[7rem] shrink-0 text-[0.82rem] uppercase tracking-[0.12em] text-stone-700/80";

const statValueClassName =
  "shrink-0 font-[var(--heading)] text-[clamp(1.2rem,2.1vw,1.7rem)] tabular-nums text-stone-900";

export function HeroSection({
  hasErrors,
  stateCount,
  diagnosticCount,
}: HeroSectionProps) {
  const parserLabel = hasErrors ? "Blocked" : "Live";
  const parserValueClassName = hasErrors
    ? "text-red-900"
    : "text-emerald-900";

  return (
    <section className="hero-band grid items-stretch gap-3 min-[981px]:grid-cols-[minmax(0,1.45fr)_minmax(280px,1fr)]">
      <div className="hero-copy rounded-3xl border border-stone-800/10 bg-[radial-gradient(circle_at_top_left,rgba(238,155,0,0.18),transparent_38%),linear-gradient(145deg,rgba(255,250,240,0.98),rgba(247,235,214,0.88))] px-5 py-[18px] shadow-[0_18px_45px_rgba(75,44,18,0.08)] max-[720px]:p-4">
        <p className="eyebrow mb-2 text-[0.72rem] uppercase tracking-[0.16em] text-amber-700">
          Flow2State Compiler
        </p>
        <h1 className="text-[clamp(1.25rem,2.1vw,1.8rem)] leading-[1.15] tracking-[-0.02em]">
          Mermaid in, machine out.
        </h1>
      </div>
      <div
        className="hero-stats grid gap-px overflow-hidden rounded-3xl border border-stone-800/10 bg-stone-800/10 shadow-[0_18px_45px_rgba(75,44,18,0.08)]"
        aria-label="Compiler summary"
      >
        <article
          className={`${statCardClassName} ${hasErrors ? "from-red-50/90 to-red-100/60" : "from-emerald-50/90 to-emerald-100/60"}`}
          aria-live="polite"
        >
          <span className={statLabelClassName}>Parser</span>
          <strong className={`${statValueClassName} ${parserValueClassName}`}>
            {parserLabel}
          </strong>
        </article>
        <div className="grid grid-cols-2 gap-px">
          <article className={statCardClassName}>
            <span className={statLabelClassName}>States</span>
            <strong className={statValueClassName}>{stateCount}</strong>
          </article>
          <article className={statCardClassName}>
            <span className={statLabelClassName}>Diagnostics</span>
            <strong className={statValueClassName}>{diagnosticCount}</strong>
          </article>
        </div>
      </div>
    </section>
  );
}
