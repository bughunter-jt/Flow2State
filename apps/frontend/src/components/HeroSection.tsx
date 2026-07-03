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
        <h1>Design a workflow, inspect the IR, ship executable TypeScript.</h1>
        <p className="hero-text">
          The editor drives the compiler core directly. Every change reparses
          the Mermaid subset, validates the IR, regenerates the machine, and
          redraws the preview from the IR.
        </p>
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
