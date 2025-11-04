// server.js  - Stripe backend for MailRun-Orlando

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

// IMPORTANT: set STRIPE_SECRET_KEY in Render dashboard (Environment tab)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Allow JSON bodies and cross-origin calls from your static site
app.use(cors());
app.use(express.json());

// Your Stripe Price IDs
const PRICE_IDS = {
  standard: 'price_1SP71s2E8UrZzRbd8HSF8ile',
  promo:    'price_1SP72n2E8UrZzRbdz5FncYGG',
  rush:     'price_1SP73c2E8UrZzRbdVEqSv5SM',
  heavy:    'price_1SP7My2E8UrZzRbdxAMRieAy',
  addBox:   'price_1SP7Nt2E8UrZzRbd9GEmyrkf',
};

// POST /create-checkout-session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Build Stripe line items using your keys above
    const line_items = items.map((item) => {
      const price = PRICE_IDS[item.key];
      if (!price) {
        throw new Error(`Unknown item key: ${item.key}`);
      }
      return {
        price,
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url:
        process.env.SUCCESS_URL ||
        'https://mailrun-orlando.com/success.html',
      cancel_url:
        process.env.CANCEL_URL ||
        'https://mailrun-orlando.com/',
    });

    // Frontend will redirect to this URL
    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

// Render will inject PORT; default to 10000 for local use
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`MailRun Stripe server listening on port ${PORT}`);
});

module.exports = app;
