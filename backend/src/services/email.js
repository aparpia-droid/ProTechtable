const sgMail = require("@sendgrid/mail");
const { logger } = require("../utils/logger");

let configured = false;

function ensureSendGrid() {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!key || !from) {
    return false;
  }
  if (!configured) {
    sgMail.setApiKey(key);
    configured = true;
  }
  return true;
}

/**
 * @param {string} to
 * @param {string} token
 */
async function sendVerificationEmail(to, token) {
  if (!ensureSendGrid()) {
    logger.warn("SendGrid not configured; skipping verification email");
    return;
  }
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  const url = `${base}/verify-email?token=${encodeURIComponent(token)}`;
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Verify your ProTechtable account",
    text: `Verify your email: ${url}`,
    html: `<p>Verify your email by clicking <a href="${url}">this link</a>.</p>`,
  };
  await sgMail.send(msg);
}

/**
 * @param {string} to
 * @param {string} token
 */
async function sendPasswordResetEmail(to, token) {
  if (!ensureSendGrid()) {
    logger.warn("SendGrid not configured; skipping password reset email");
    return;
  }
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  const url = `${base}/reset-password/${encodeURIComponent(token)}`;
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Reset your ProTechtable password",
    text: `Reset password: ${url}`,
    html: `<p>Reset your password using <a href="${url}">this link</a>. Expires in 1 hour.</p>`,
  };
  await sgMail.send(msg);
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
