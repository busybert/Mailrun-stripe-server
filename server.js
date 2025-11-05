import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ MailRun Stripe backend is running!");
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "https://mailrun-orlando.com/success",
      cancel_url: "https://mailrun-orlando.com/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
