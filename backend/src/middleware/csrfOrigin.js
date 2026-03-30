/**
 * In production, require Origin (or Referer) to align with FRONTEND_URL for mutating requests.
 * Webhooks are excluded. Fails closed if FRONTEND_URL is missing in production.
 */
function csrfOriginCheck(req, res, next) {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return next();
  }
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  const url = req.originalUrl || req.url || "";
  if (url.includes("/api/payment/webhook")) {
    return next();
  }

  const allowed = process.env.FRONTEND_URL;
  if (!allowed) {
    return res.status(403).json({
      success: false,
      message: "Server misconfigured: FRONTEND_URL not set",
    });
  }

  const origin = (req.get("origin") || req.get("referer") || "").split("?")[0];
  const base = allowed.replace(/\/$/, "");
  if (!origin) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  const norm = origin.replace(/\/$/, "");
  if (norm === base || norm.startsWith(base + "/")) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
}

module.exports = { csrfOriginCheck };
