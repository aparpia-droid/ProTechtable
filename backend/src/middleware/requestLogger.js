const { logger } = require("../utils/logger");

/**
 * Logs method, path, status, duration. Never logs bodies or PII.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: ms,
    });
  });
  next();
}

module.exports = { requestLogger };
