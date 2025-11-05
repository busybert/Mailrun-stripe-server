// server.js – FINAL CLEAN VERSION
import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();

// Allow your frontend to access this backend
app.use(
  cors({
    origin: ["https://mailrun-orlando.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ Stripe initialization — using your secret key from Render environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });
console.log("✅ Stripe key loaded:", process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.slice(0, 10) + "..." : "❌ NOT FOUND");


// ✅ Test endpoint
app.get("/", (req, res) => {
  res.send("✅ MailRun Stripe backend is running correctly!");
});

// ✅ Create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems } = req.body;

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "Invalid line items" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "https://mailrun-orlando.com/success",
      cancel_url: "https://mailrun-orlando.com/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    res
      .status(500)
      .json({ error: error.message || "Internal server error in Stripe setup" });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
