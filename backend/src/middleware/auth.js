const jwt = require("jsonwebtoken");
const { prisma } = require("../utils/db");
const { logger } = require("../utils/logger");
const { COOKIE_NAME } = require("../utils/jwt");

/**
 * Verify JWT from httpOnly cookie only; load user from DB for subscription tier and session invalidation.
 */
async function authMiddleware(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      logger.error("JWT_SECRET misconfigured");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        passwordChangedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (user.passwordChangedAt) {
      const changedAtSeconds = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < changedAtSeconds) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    };
    return next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return next(e);
  }
}

module.exports = { authMiddleware, COOKIE_NAME };
