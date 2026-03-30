const crypto = require("crypto");

/**
 * @param {string} rawToken
 * @returns {string}
 */
function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

module.exports = { hashToken };
