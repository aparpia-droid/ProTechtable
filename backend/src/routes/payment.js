const express = require("express");
const Stripe = require("stripe");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");
const { checkoutValidators } = require("../utils/validators");
const { logger } = require("../utils/logger");

const prisma = new PrismaClient();
const router = express.Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

router.post("/create-checkout", authMiddleware, checkoutValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ success: false, message: "Payments unavailable" });
    }

    const { plan } = req.body;
    const priceId =
      plan === "annual" ? process.env.STRIPE_ANNUAL_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;
    if (!priceId) {
      logger.error("Stripe price IDs not configured");
      return res.status(503).json({ success: false, message: "Payments unavailable" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontend}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/pricing`,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
    };
    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }

    return res.json({ success: true, sessionUrl: session.url });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
