const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const {
  signupValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  paramVerifyToken,
} = require("../utils/validators");
const { authLimiter } = require("../middleware/rateLimiter");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email");
const { logger } = require("../utils/logger");
const { COOKIE_NAME } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES = "30d";

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    },
    secret,
    { expiresIn: JWT_EXPIRES }
  );
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

router.post("/signup", authLimiter, signupValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { email, password, firstName, lastName } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        verificationToken,
        emailVerified: false,
      },
    });
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (e) {
      logger.warn("Verification email failed", { message: e.message });
    }
    return res.json({ success: true, message: "Check email to verify" });
  } catch (e) {
    next(e);
  }
});

router.post("/login", authLimiter, loginValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
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
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/verify-email/:token", paramVerifyToken(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { token } = req.params;
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });
    return res.json({ success: true, message: "Email verified" });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", authLimiter, forgotPasswordValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });
      try {
        await sendPasswordResetEmail(email, resetToken);
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

router.post("/reset-password", authLimiter, resetPasswordValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
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
      },
    });
    return res.json({ success: true, message: "Password reset" });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ success: true, message: "Logged out" });
});

module.exports = router;
