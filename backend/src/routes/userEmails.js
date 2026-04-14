const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middleware/auth");
const { familyEmailValidators, familyVerifyValidators } = require("../utils/validators");
const { validate } = require("../middleware/validate");
const { prisma } = require("../utils/db");
const { sendFamilyVerificationCode } = require("../services/email");
const { logger } = require("../utils/logger");
const { verifyCodeLimiter } = require("../middleware/rateLimiter");

const router = express.Router();
router.use(authMiddleware);

const MAX_FAMILY_EMAILS = 5;
const CODE_EXPIRY_MS = 15 * 60 * 1000;

router.get("/emails", async (req, res, next) => {
  try {
    const rows = await prisma.userEmail.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        verified: true,
        createdAt: true,
      },
    });
    return res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.post("/emails", familyEmailValidators, validate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isPremiumEmail =
      process.env.UNLOCK_ALL_FEATURES === "true" || user.subscriptionTier === "premium";
    if (!isPremiumEmail) {
      return res.status(403).json({
        success: false,
        message: "Family emails are available on Premium only.",
      });
    }

    const email = req.body.email.toLowerCase();
    if (email === user.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: "That is already your account email." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "That email is already registered." });
    }

    const count = await prisma.userEmail.count({ where: { userId: user.id } });
    if (count >= MAX_FAMILY_EMAILS) {
      return res.status(400).json({
        success: false,
        message: `You can add up to ${MAX_FAMILY_EMAILS} family emails.`,
      });
    }

    const dup = await prisma.userEmail.findUnique({
      where: { userId_email: { userId: user.id, email } },
    });
    if (dup) {
      return res.status(409).json({ success: false, message: "That email is already on your list." });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const verifyCodeHash = await bcrypt.hash(code, 10);
    const verifyCodeExpiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    const row = await prisma.userEmail.create({
      data: {
        userId: user.id,
        email,
        verified: false,
        verifyCodeHash,
        verifyCodeExpiresAt,
      },
    });

    try {
      await sendFamilyVerificationCode(email, code);
    } catch (e) {
      logger.warn("family_verify_email_failed", { message: e.message });
      await prisma.userEmail.delete({ where: { id: row.id } });
      return res.status(503).json({ success: false, message: "Could not send verification email." });
    }

    return res.status(201).json({
      success: true,
      message: "Verification code sent.",
      data: { id: row.id, email: row.email, verified: false },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/emails/:id/verify", verifyCodeLimiter, familyVerifyValidators, validate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await prisma.userEmail.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (row.verified) {
      return res.json({ success: true, message: "Already verified" });
    }
    if (!row.verifyCodeHash || !row.verifyCodeExpiresAt || row.verifyCodeExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired. Remove and add the email again." });
    }
    const ok = await bcrypt.compare(req.body.code, row.verifyCodeHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid code" });
    }

    await prisma.userEmail.update({
      where: { id: row.id },
      data: {
        verified: true,
        verifyCodeHash: null,
        verifyCodeExpiresAt: null,
      },
    });

    return res.json({ success: true, message: "Email verified" });
  } catch (e) {
    next(e);
  }
});

router.delete("/emails/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await prisma.userEmail.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    await prisma.userEmail.delete({ where: { id: row.id } });
    return res.json({ success: true, message: "Removed" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
