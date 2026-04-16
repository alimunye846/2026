import { useMemo, useState } from 'react';
import { products } from './products';

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const brandNotes = [
  'Organic, vegan beauty essentials',
  'Designed with sensitive skin in mind',
  'Simple rituals. Soft results.',
];

const rituals = [
  {
    title: 'Cleanse gently',
    text: 'Begin with formulas that remove the day without disturbing your skin barrier.',
  },
  {
    title: 'Hydrate lightly',
    text: 'Layer skin with refreshing moisture for a calm, balanced, dewy finish.',
  },
  {
    title: 'Nourish daily',
    text: 'Finish with comforting textures that leave skin soft, radiant, and cared for.',
  },
];

export default function App() {
  const [quantities, setQuantities] = useState(
    Object.fromEntries(products.map((product) => [product.id, 1]))
  );
  const [loadingId, setLoadingId] = useState('');
  const [error, setError] = useState('');

  const selectedTotal = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.price * (quantities[product.id] || 1),
        0
      ),
    [quantities]
  );

  function updateQuantity(id, nextQuantity) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(1, Math.min(10, nextQuantity)),
    }));
  }

  async function handleCheckout(product) {
    setLoadingId(product.id);
    setError('');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: product.id, quantity: quantities[product.id] || 1 }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to start checkout.');
      }

      if (!data.url) {
        throw new Error('Stripe checkout URL was not returned.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Something went wrong starting checkout.');
      setLoadingId('');
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-name">Aaliyah&apos;s Grace</span>
          <span className="brand-subtitle">Organic beauty for sensitive skin</span>
        </div>
        <a href="#shop" className="text-link">
          Shop essentials
        </a>
      </header>

      <section className="hero-luxury">
        <div className="hero-copy-luxury">
          <p className="eyebrow-luxury">Skin-first beauty</p>
          <h1>Effortless beauty for sensitive skin.</h1>
          <p className="lead-luxury">
            Gentle, organic, vegan formulas created to comfort delicate skin and bring a soft,
            healthy glow to your everyday routine.
          </p>
          <div className="hero-actions-luxury">
            <a href="#shop" className="button-primary">
              Shop essentials
            </a>
            <a href="#ritual" className="button-secondary">
              Explore the ritual
            </a>
          </div>
        </div>

        <aside className="hero-card-luxury">
          <p className="hero-card-label">Aaliyah&apos;s Grace</p>
          <ul className="hero-note-list">
            {brandNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="hero-card-copy">
            Thoughtfully curated for customers who want beauty to feel elegant, calm, and easy to trust.
          </p>
        </aside>
      </section>

      <section className="statement-band">
        <p>Skincare that feels as good as it looks.</p>
      </section>

      <section className="editorial-grid" id="ritual">
        <article className="editorial-card editorial-copy">
          <p className="eyebrow-luxury">About</p>
          <h2>Simple formulas. Soft textures. A calmer routine.</h2>
          <p>
            At Aaliyah&apos;s Grace, we believe beauty should never come at the cost of your skin&apos;s comfort.
            Our collection is built around organic, vegan essentials that feel luxurious while remaining
            gentle enough for sensitive skin.
          </p>
        </article>

        <article className="editorial-card editorial-image-card">
          <div className="editorial-visual">
            <div className="visual-copy">
              <span className="mini-kicker">Everyday essentials</span>
              <h3>Build a softer daily ritual.</h3>
            </div>
          </div>
        </article>
      </section>

      <section className="ritual-section">
        <div className="section-heading-luxury">
          <p className="eyebrow-luxury">The routine</p>
          <h2>Three steps to calm, balanced skin.</h2>
        </div>
        <div className="ritual-grid">
          {rituals.map((item) => (
            <article className="ritual-card" key={item.title}>
              <span className="ritual-number">0{rituals.indexOf(item) + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {error ? <div className="notice-banner">{error}</div> : null}

      <section className="shop-section-luxury" id="shop">
        <div className="shop-header-luxury">
          <div>
            <p className="eyebrow-luxury">Essentials</p>
            <h2>Your everyday edit.</h2>
            <p className="shop-intro">
              A concise collection of beauty staples designed to cleanse, hydrate, and nourish sensitive skin.
            </p>
          </div>
          <div className="selected-total-card">
            <span>Selected total</span>
            <strong>{currencyFormatter.format(selectedTotal / 100)}</strong>
          </div>
        </div>

        <div className="product-grid-luxury">
          {products.map((product) => (
            <article className="product-card-luxury" key={product.id}>
              <div className="product-image-shell">
                <img src={product.image} alt={product.name} className="product-image-luxury" />
                <span className="product-badge">{product.badge}</span>
              </div>

              <div className="product-body-luxury">
                <div className="product-header-luxury">
                  <div>
                    <h3>{product.name}</h3>
                    <p className="product-short">{product.shortDescription}</p>
                  </div>
                  <span className="price-tag">{currencyFormatter.format(product.price / 100)}</span>
                </div>

                <p className="product-copy">{product.description}</p>

                <div className="product-actions-luxury">
                  <div className="quantity-pill" aria-label={`${product.name} quantity selector`}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                    >
                      −
                    </button>
                    <span>{quantities[product.id] || 1}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="button-primary button-buy"
                    onClick={() => handleCheckout(product)}
                    disabled={loadingId === product.id}
                  >
                    {loadingId === product.id ? 'Redirecting…' : 'Buy now'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-panel-luxury">
        <div>
          <p className="eyebrow-luxury">Aaliyah&apos;s Grace</p>
          <h2>Gentle beauty, refined for everyday use.</h2>
          <p>
            No harsh ingredients. No cluttered routine. Just elegant essentials designed to support your natural glow.
          </p>
        </div>
        <a href="#shop" className="button-secondary">
          Build your routine
        </a>
      </section>
    </main>
  );
}
