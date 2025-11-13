// server.js
import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

// 🔑 Read Stripe secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("❌ STRIPE_SECRET_KEY is not set. Please add it in Render → Environment.");
  // Exit so Render shows a clear error instead of running a broken server
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" // safe to specify; Stripe will ignore if not needed
});

// ✅ Allow your frontend (Hostinger) to talk to this backend (Render)
app.use(
  cors({
    origin: [
      "https://mailrunorlando.com",
      "http://localhost:3000",
      "http://localhost:5173"
    ]
  })
);

app.use(express.json());

// 🧾 Map the keys from your React app to Stripe Price IDs
// IMPORTANT: these price_ IDs must all be from the SAME STRIPE MODE
// - If STRIPE_SECRET_KEY is sk_test_..., these must be TEST price IDs
// - If STRIPE_SECRET_KEY is sk_live_..., these must be LIVE price IDs
const PRICE_LOOKUP = {
  // One-time pickup services
  standard: "price_1SOtK2CSZzNce3wln59DxSBU",      // $12 Standard Pickup
  promo: "price_1SOtmgCSZzNce3wlZw96Hvz6",         // $9 PROMO
  rush: "price_1SOtneCSZzNce3wl32oQtOz6",          // $19 Rush
  payPerPickup: "price_1SSsXqCSZzNce3wlb5SJpzJ4",  // $9.99 AMAZON Returns Pay-per Pickup

  // Add-ons
  heavy: "price_1SOtryCSZzNce3wlp8vzotyR",         // $6 Heavy Box
  addBox: "price_1SOtsvCSZzNce3wllMLW0cAC",        // $3 Add a Box

  // Subscriptions – AMAZON Returns Subscribe & Save
  subMonthly: "price_1SSsfECSZzNce3wlqnSEkWhS",    // $19.99 / month
  subAnnual: "price_1SSsghCSZzNce3wltR9tp3u9"      // $199.99 / year
};

// 🧠 Helper to decide if any item is a subscription
function hasSubscriptionItem(items = []) {
  return items.some(
    (item) => item.key === "subMonthly" || item.key === "subAnnual"
  );
}

// 📦 Checkout route – this is what your frontend calls via redirectToCheckout()
app.post("/api/checkout", async (req, res) => {
  try {
    const { items } = req.body; // [{ key, quantity }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items to checkout" });
    }

    const mode = hasSubscriptionItem(items) ? "subscription" : "payment";

    const line_items = items.map((item) => {
      const priceId = PRICE_LOOKUP[item.key];
      if (!priceId) {
        throw new Error(`Unknown item key: ${item.key}`);
      }

      return {
        price: priceId,
        quantity: item.quantity || 1
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items,
      success_url:
        "https://mailrunorlando.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://mailrunorlando.com/pricing"
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Simple health check route
app.get("/", (req, res) => {
  res.send("MailRun Stripe server is running ✅");
});

// Render sets PORT for you
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
