const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

const COOKIE_NAME = "token";

/**
 * Verify JWT from Authorization header (Bearer) or httpOnly cookie.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      logger.error("JWT_SECRET misconfigured");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    let token = null;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    }
    if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier || "free",
    };
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = { authMiddleware, COOKIE_NAME };
