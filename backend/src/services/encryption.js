const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * @returns {Buffer}
 */
function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt plaintext for storage. Returns base64 JSON: { iv, tag, data }.
 * @param {string} plaintext
 * @returns {string}
 */
function encrypt(plaintext) {
  if (plaintext == null || plaintext === "") return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.from(
    JSON.stringify({
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: encrypted.toString("base64"),
    }),
    "utf8"
  ).toString("base64");
}

/**
 * @param {string} stored
 * @returns {string|null}
 */
function decrypt(stored) {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(Buffer.from(stored, "base64").toString("utf8"));
    const iv = Buffer.from(parsed.iv, "base64");
    const tag = Buffer.from(parsed.tag, "base64");
    const data = Buffer.from(parsed.data, "base64");
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

module.exports = { encrypt, decrypt };
