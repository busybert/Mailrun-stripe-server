📦 MailRun Stripe Server — Clean Minimal Setup

✅ Backend URL:
   https://mailrun-stripe-server.onrender.com

---
🚀 DEPLOYMENT STEPS (Render)
1. Go to your Render Dashboard → select "MailRun Stripe Server".
2. In "Environment Variables", confirm you have:
      STRIPE_SECRET_KEY = sk_test_51SKOopCSZzNce3wlf0vjhJgHo8Zd2hMtCrsmavClY00gVpf3rVc3BINL4We76WDzprXkya7vFtb0G9Y8TkBBfn4I00f5hfnWaC
3. Replace existing files in your GitHub repo with these.
4. Commit and push changes → Render will redeploy automatically.
5. Verify logs: should see ✅ Server running on port ...

---
🧩 FRONTEND CONNECTION
In your site’s `stripeCheckout.js`, change your fetch() line to:

fetch("https://mailrun-stripe-server.onrender.com/create-checkout-session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ lineItems }),
});

---
💳 Test Card (Stripe)
Use this in checkout:
4242 4242 4242 4242 — Any future date, any CVC, any zip.

---
💡 When ready for LIVE mode:
• Update the Render environment variable with your LIVE key:
     STRIPE_SECRET_KEY = sk_live_...
• Update the frontend publishable key in `stripeCheckout.js`.
