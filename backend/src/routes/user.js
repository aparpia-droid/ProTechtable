const express = require("express");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");
const {
  profileUpdateValidators,
  changePasswordValidators,
} = require("../utils/validators");
const { encrypt, decrypt } = require("../services/encryption");
const { logger } = require("../utils/logger");

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

router.get("/profile", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        encryptedPhone: true,
        encryptedDob: true,
        subscriptionTier: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      user: {
        ...user,
        phone: user.encryptedPhone ? decrypt(user.encryptedPhone) : null,
        dob: user.encryptedDob ? decrypt(user.encryptedDob) : null,
        encryptedPhone: undefined,
        encryptedDob: undefined,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.put("/profile", profileUpdateValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { firstName, lastName, phone, dob } = req.body;

    let encryptedPhone = undefined;
    let encryptedDob = undefined;
    if (phone !== undefined) {
      encryptedPhone = phone ? encrypt(phone) : null;
    }
    if (dob !== undefined) {
      encryptedDob = dob ? encrypt(dob) : null;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(encryptedPhone !== undefined && { encryptedPhone }),
        ...(encryptedDob !== undefined && { encryptedDob }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionTier: true,
        emailVerified: true,
        encryptedPhone: true,
        encryptedDob: true,
      },
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: user.subscriptionTier,
        emailVerified: user.emailVerified,
        phone: user.encryptedPhone ? decrypt(user.encryptedPhone) : null,
        dob: user.encryptedDob ? decrypt(user.encryptedDob) : null,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.put("/password", changePasswordValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return res.json({ success: true, message: "Password updated" });
  } catch (e) {
    next(e);
  }
});

router.delete("/account", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stripe = getStripe();
    if (stripe && user.stripeCustomerId) {
      try {
        const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, status: "all" });
        for (const s of subs.data) {
          if (s.status === "active" || s.status === "trialing" || s.status === "past_due") {
            await stripe.subscriptions.cancel(s.id);
          }
        }
      } catch (e) {
        logger.warn("Stripe cancel on delete failed", { message: e.message });
      }
    }

    await prisma.user.delete({ where: { id: user.id } });

    return res.json({ success: true, message: "Account deleted" });
  } catch (e) {
    next(e);
  }
});

router.get("/assessments", async (req, res, next) => {
  try {
    const list = await prisma.assessment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        emailSearched: true,
        score: true,
        riskLevel: true,
        breachesFound: true,
        createdAt: true,
      },
    });
    return res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
});

router.get("/subscription", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.subscriptionTier !== "premium" || !user.stripeCustomerId) {
      return res.json({
        success: true,
        data: {
          tier: "free",
          status: "active",
        },
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.json({
        success: true,
        data: {
          tier: user.subscriptionTier,
          status: "unknown",
        },
      });
    }

    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 1,
    });
    const sub = subs.data[0];
    return res.json({
      success: true,
      data: {
        tier: "premium",
        status: sub?.status || "active",
        currentPeriodEnd: sub?.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
