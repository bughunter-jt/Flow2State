type HeroSectionProps = {
  hasErrors: boolean;
  stateCount: number;
  diagnosticCount: number;
};

export function HeroSection({
  hasErrors,
  stateCount,
  diagnosticCount,
}: HeroSectionProps) {
  return (
    <section className="hero-band">
      <div className="hero-copy">
        <p className="eyebrow">Flow2State Compiler</p>
        <h1>Mermaid in, machine out.</h1>
      </div>
      <div className="hero-stats" aria-label="Compiler summary">
        <article>
          <span>Parser</span>
          <strong>{hasErrors ? "Blocked" : "Live"}</strong>
        </article>
        <article>
          <span>States</span>
          <strong>{stateCount}</strong>
        </article>
        <article>
          <span>Diagnostics</span>
          <strong>{diagnosticCount}</strong>
        </article>
      </div>
    </section>
  );
}
