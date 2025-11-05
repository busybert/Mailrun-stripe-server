// server.js — MailRun Stripe Backend (TEST mode)
import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

// ✅ Allow requests from your live website
app.use(
  cors({
    origin: [
      "https://mailrun-orlando.com",
      "https://www.mailrun-orlando.com",
      "http://localhost:3000", // optional for testing
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Body parser to handle JSON
app.use(bodyParser.json());

// ✅ Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30",
});

// ✅ Health check route (for Render)
app.get("/", (req, res) => {
  res.send("✅ MailRun Stripe backend is running!");
});

// ✅ Create Checkout Session endpoint
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems } = req.body;

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "No line items provided." });
    }

    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "https://mailrun-orlando.com/success",
      cancel_url: "https://mailrun-orlando.com/cancel",
    });

    console.log("✅ Created session:", session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
