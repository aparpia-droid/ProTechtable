const { logger } = require("../utils/logger");

/**
 * Global error handler — no stack traces or internals to clients.
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  logger.error("request_error", {
    message: err.message,
    path: req.originalUrl,
    status,
  });
  const message =
    status >= 500 ? "Something went wrong" : err.message || "Request failed";
  res.status(status).json({ success: false, message });
}

module.exports = { errorHandler };
