// server.js
import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();

// 🔑 Read Stripe secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error(
    "❌ STRIPE_SECRET_KEY is not set. Please add it in Render → Environment."
  );
  process.exit(1);
}

// Optional: fix Stripe API version
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20"
});

// ✅ Allow ALL origins + Fix Preflight CORS
app.use(cors());
app.options("*", cors());

app.use(express.json());

// 🧾 LIVE PRICE IDs (you provided these)
const PRICE_LOOKUP = {
  // One-time pickup services
  standard: "price_1SP71s2E8UrZzRbd8HSF8ile",    // $12 Standard
  promo: "price_1SP72n2E8UrZzRbdz5FncYGG",       // $9 Promo
  rush: "price_1SP73c2E8UrZzRbdVEqSv5SM",        // $19 Rush

  // Amazon special services
  payPerPickup: "price_1SSsXqCSZzNce3wlb5SJpzJ4", // $9.99 Amazon Daily (one-time)

  // Add-ons
  heavy: "price_1SP7My2E8UrZzRbdxAMRieAy",        // $6 Heavy Box
  addBox: "price_1SP7Nt2E8UrZzRbd9GEmyrkf",        // $3 Add a Box

  // Subscriptions – AMAZON Returns Subscribe & Save
  subMonthly: "price_1SSv5K2E8UrZzRbdVdPlsu9T",   // $19.99 monthly
  subAnnual: "price_1SSv6e2E8UrZzRbdVqkqKeFi"     // $199.99 yearly
};

// 🧠 Detect subscription checkout
function hasSubscriptionItem(items = []) {
  return items.some(
    (item) => item.key === "subMonthly" || item.key === "subAnnual"
  );
}

// 📦 Checkout endpoint
app.post("/api/checkout", async (req, res) => {
  try {
    const { items } = req.body;
    console.log("📦 Incoming checkout items:", items);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items to checkout" });
    }

    const mode = hasSubscriptionItem(items) ? "subscription" : "payment";
    console.log("💳 Checkout mode:", mode);

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

    console.log("✅ Stripe session created:", session.id);
    res.json({ url: session.url });

  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("MailRun Stripe server is running LIVE mode ✅");
});

// Render port
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
