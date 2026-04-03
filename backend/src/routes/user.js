const express = require("express");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middleware/auth");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");
const {
  profileUpdateValidators,
  changePasswordValidators,
  deleteAccountValidators,
} = require("../utils/validators");
const { validate } = require("../middleware/validate");
const { encrypt, decrypt } = require("../services/encryption");
const { logger } = require("../utils/logger");
const { prisma } = require("../utils/db");
const { getStripe } = require("../utils/stripe");

const router = express.Router();

router.use(authMiddleware);

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
        monitoringEnabled: true,
        isStudent: true,
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

router.put("/profile", profileUpdateValidators, validate, async (req, res, next) => {
  try {
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

router.put("/password", changePasswordValidators, validate, async (req, res, next) => {
  try {
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
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });
    const freshToken = signToken({ id: req.user.id, email: req.user.email });
    setAuthCookie(res, freshToken);
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
});

router.delete("/account", deleteAccountValidators, validate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
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

    clearAuthCookie(res);

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
    const decrypted = list.map((row) => ({
      ...row,
      emailSearched: (row.emailSearched && decrypt(row.emailSearched)) || row.emailSearched,
    }));
    return res.json({ success: true, data: decrypted });
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

// POST /api/user/monitoring — toggle continuous monitoring
router.post("/monitoring", async (req, res, next) => {
  try {
    const enabled = Boolean(req.body.enabled);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Verify your email first" });
    }

    if (enabled && user.subscriptionTier !== "premium") {
      return res.status(403).json({
        success: false,
        message: "Continuous monitoring is a Premium feature.",
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { monitoringEnabled: enabled },
    });

    return res.json({
      success: true,
      message: enabled
        ? "Monitoring enabled. We'll alert you when new breaches are detected."
        : "Monitoring disabled.",
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
