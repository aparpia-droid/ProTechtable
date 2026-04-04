const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  signupValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  paramVerifyToken,
  resendVerificationValidators,
} = require("../utils/validators");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendExistingAccountEmail,
} = require("../services/email");
const { logger } = require("../utils/logger");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");
const { prisma } = require("../utils/db");
const { hashToken } = require("../utils/tokenHash");

const router = express.Router();

const BCRYPT_ROUNDS = 12;

function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    subscriptionTier: user.subscriptionTier,
    isStudent: Boolean(user.isStudent),
  };
}

router.post("/signup", authLimiter, signupValidators, validate, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, ref } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      try {
        await sendExistingAccountEmail(email);
      } catch (e) {
        logger.warn("Existing account email failed", { message: e.message });
      }
      return res.status(201).json({
        success: true,
        message: "Check your email to verify your account.",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const now = new Date();

    const emailLower = email.toLowerCase();
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        verificationToken: hashedVerificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        emailVerified: false,
        passwordChangedAt: now,
        isStudent: emailLower.endsWith(".edu"),
      },
    });

    if (ref && typeof ref === "string") {
      const refTrim = ref.trim();
      if (refTrim) {
        try {
          const referrer = await prisma.user.findUnique({ where: { referralCode: refTrim } });
          if (referrer && referrer.id !== newUser.id) {
            await prisma.referral.create({
              data: { referrerId: referrer.id, refereeId: newUser.id },
            });
            await prisma.user.update({
              where: { id: referrer.id },
              data: { referralCount: { increment: 1 } },
            });
            await prisma.user.update({
              where: { id: newUser.id },
              data: { referredBy: refTrim },
            });
          }
        } catch (refError) {
          logger.warn("Referral tracking failed", { message: refError.message });
        }
      }
    }

    try {
      await sendVerificationEmail(email, rawVerificationToken);
    } catch (e) {
      logger.warn("Verification email failed", { message: e.message });
    }

    return res.status(201).json({
      success: true,
      message: "Check your email to verify your account.",
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", authLimiter, loginValidators, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Email not verified" });
    }
    const token = signToken(user);
    setAuthCookie(res, token);
    return res.json({
      success: true,
      user: safeUser(user),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/verify-email/:token", paramVerifyToken(), validate, async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashed = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { verificationToken: hashed },
          {
            OR: [{ verificationTokenExpiry: null }, { verificationTokenExpiry: { gt: new Date() } }],
          },
        ],
      },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });
    const authToken = signToken({ id: user.id, email: user.email });
    setAuthCookie(res, authToken);
    return res.json({ success: true, message: "Email verified", autoLogin: true });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", authLimiter, forgotPasswordValidators, validate, async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashToken(rawToken);
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashedToken, resetTokenExpiry },
      });
      try {
        await sendPasswordResetEmail(email, rawToken);
      } catch (e) {
        logger.warn("Password reset email failed", { message: e.message });
      }
    }
    return res.json({
      success: true,
      message: "If account exists, reset email sent",
    });
  } catch (e) {
    next(e);
  }
});

router.post("/reset-password", authLimiter, resetPasswordValidators, validate, async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashed = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        AND: [{ resetToken: hashed }, { resetTokenExpiry: { gt: new Date() } }],
      },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        passwordChangedAt: new Date(),
      },
    });
    return res.json({ success: true, message: "Password reset" });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/resend-verification",
  authLimiter,
  resendVerificationValidators,
  validate,
  async (req, res, next) => {
    const successMsg = {
      success: true,
      message: "If an unverified account exists, a verification email has been sent.",
    };
    try {
      const user = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (!user || user.emailVerified) {
        return res.json(successMsg);
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashToken(rawToken);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: hashedToken,
          verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      await sendVerificationEmail(user.email, rawToken);
      return res.json(successMsg);
    } catch (err) {
      logger.warn("resend_verification_error", { error: err.message });
      return res.json(successMsg);
    }
  }
);

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: "Logged out" });
});

module.exports = router;
