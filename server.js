// server.js — MailRun Stripe Backend (TEST mode, clean final version)
import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// ✅ Allow your frontend to reach this backend
app.use(
  cors({
    origin: [
      "https://mailrun-orlando.com",
      "https://www.mailrun-orlando.com",
      "http://localhost:3000", // optional for local testing
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

// ✅ Initialize Stripe with your **SECRET** key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Health check route for Render
app.get("/", (req, res) => {
  res.send("✅ MailRun Stripe backend is running correctly!");
});

// ✅ Checkout route (the frontend calls this, not Stripe directly)
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems } = req.body;

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "No line items provided." });
    }

    // ✅ Securely create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "https://mailrun-orlando.com/success",
      cancel_url: "https://mailrun-orlando.com/cancel",
    });

    console.log("✅ Checkout session created:", session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe session error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Dynamic port (Render uses this automatically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
