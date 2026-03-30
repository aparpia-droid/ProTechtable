const Stripe = require("stripe");

let stripeInstance = null;

/**
 * @returns {Stripe | null}
 */
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

module.exports = { getStripe };
