import Stripe from 'stripe';
import { products } from '../src/products.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const baseUrl = process.env.PUBLIC_BASE_URL;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' }) : null;

function getOrigin(req) {
  const forwardedProto = req.headers['x-forwarded-proto'] || 'https';
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
  return `${forwardedProto}://${forwardedHost}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY environment variable.' });
  }

  const siteUrl = baseUrl || getOrigin(req);

  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length) {
      return res.status(400).json({ error: 'No items were provided.' });
    }

    const line_items = items.map((item) => {
      const product = products.find((entry) => entry.id === item.id);

      if (!product) {
        throw new Error(`Unknown product: ${item.id}`);
      }

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
            description: product.shortDescription,
            images: product.image ? [product.image] : undefined,
          },
          unit_amount: product.price,
        },
        quantity: Math.max(1, Math.min(10, Number(item.quantity) || 1)),
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/cancel`,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'IE', 'FR', 'DE'],
      },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to create checkout session.' });
  }
}
