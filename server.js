import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Use your secret key from environment variables (Render → Environment)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// 🧠 Map frontend service keys to Stripe Price IDs
const priceMap = {
  standard: "price_1SP71s2E8UrZzRbd8HSF8ile",
  promo: "price_1SP72n2E8UrZzRbdz5FncYGG",
  rush: "price_1SP73c2E8UrZzRbdVEqSv5SM",
  heavy: "price_1SP7My2E8UrZzRbdxAMRieAy",
  addBox: "price_1SP7Nt2E8UrZzRbd9GEmyrkf",
};

// ✅ Create Checkout Session endpoint
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = items
      .filter((item) => priceMap[item.key])
      .map((item) => ({
        price: priceMap[item.key],
        quantity: item.quantity,
      }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "https://mailrun-orlando.com/success",
      cancel_url: "https://mailrun-orlando.com/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ MailRun Stripe backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
