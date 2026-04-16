export default function Cancel() {
  return (
    <main className="state-page">
      <section className="state-card-luxury">
        <p className="eyebrow-luxury">Checkout cancelled</p>
        <h1>Your bag is still waiting.</h1>
        <p>
          No worries — your products haven&apos;t gone anywhere. Return to the store whenever you&apos;re ready.
        </p>
        <div className="state-actions">
          <a href="/" className="button-primary">Back to shop</a>
        </div>
      </section>
    </main>
  );
}
