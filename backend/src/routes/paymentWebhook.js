const express = require("express");
const { logger } = require("../utils/logger");
const { prisma } = require("../utils/db");
const { getStripe } = require("../utils/stripe");

const router = express.Router();

/**
 * Raw body required for Stripe signature verification.
 */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res, next) => {
    try {
      const stripe = getStripe();
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripe || !secret) {
        return res.status(503).send("Webhook unavailable");
      }

      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).send("Missing signature");
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
      } catch (err) {
        logger.warn("Stripe webhook signature failed", { message: err.message });
        return res.status(400).send("Invalid signature");
      }

      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { stripeEventId: event.id },
      });
      if (existingEvent) {
        return res.json({ received: true });
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.userId || session.client_reference_id;
          const customerId = session.customer;
          const cid =
            typeof customerId === "string" ? customerId : customerId?.id || null;
          if (userId && cid) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                subscriptionTier: "premium",
                stripeCustomerId: cid,
              },
            });
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object;
          const customerId = sub.customer;
          if (customerId) {
            await prisma.user.updateMany({
              where: { stripeCustomerId: customerId },
              data: { subscriptionTier: "free" },
            });
          }
          break;
        }
        case "customer.subscription.updated": {
          const sub = event.data.object;
          const customerId = sub.customer;
          const status = sub.status;
          if (customerId) {
            const tier = status === "active" || status === "trialing" ? "premium" : "free";
            await prisma.user.updateMany({
              where: { stripeCustomerId: customerId },
              data: { subscriptionTier: tier },
            });
          }
          break;
        }
        default:
          break;
      }

      try {
        await prisma.webhookEvent.create({
          data: { stripeEventId: event.id, eventType: event.type },
        });
      } catch (e) {
        if (e.code === "P2002") {
          return res.json({ received: true });
        }
        throw e;
      }

      return res.json({ received: true });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
