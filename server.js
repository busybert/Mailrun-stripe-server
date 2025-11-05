import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "https://mailrun-orlando.com",
      "https://www.mailrun-orlando.com",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

// ✅ Backend must use SECRET KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.get("/", (req, res) => {
  res.send("✅ MailRun Stripe backend is running correctly!");
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "https://mailrun-orlando.com/success",
      cancel_url: "https://mailrun-orlando.com/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe session error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
