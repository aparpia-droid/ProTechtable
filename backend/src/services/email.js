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

function isEmailConfigured() {
  return ensureSendGrid();
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
 */
async function sendExistingAccountEmail(to) {
  if (!ensureSendGrid()) {
    logger.warn("SendGrid not configured; skipping existing-account email");
    return;
  }
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "ProTechtable signup attempt",
    text: `Someone tried to create an account with this email. If this was you, try logging in instead: ${base}/login`,
    html: `<p>Someone tried to create an account with your email. If this was you, <a href="${base}/login">log in</a> instead.</p>`,
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

/**
 * @param {string} to
 * @param {object} params
 */
async function sendAssessmentSummaryEmail(to, { score, riskLevel, breachesFound, dataBrokersFound, assessmentId }) {
  if (!ensureSendGrid()) {
    logger.warn("SendGrid not configured; skipping assessment summary email");
    return;
  }
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const riskColors = {
    low: "#22C55E",
    medium: "#EAB308",
    high: "#F97316",
    critical: "#EF4444",
  };
  const color = riskColors[riskLevel] || "#6B7280";

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Your ProTechtable Vulnerability Score: ${score}/100`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #001F3F; padding: 24px; text-align: center;">
          <h1 style="color: #FFD700; margin: 0;">ProTechtable</h1>
        </div>
        <div style="padding: 24px; background: white;">
          <h2 style="margin-top: 0;">Your Vulnerability Assessment Results</h2>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; font-weight: bold; color: ${color};">${score}/100</div>
            <div style="font-size: 18px; text-transform: uppercase; color: ${color};">${riskLevel} Risk</div>
          </div>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>${breachesFound}</strong> data breaches found</p>
            <p style="margin: 4px 0;"><strong>${dataBrokersFound}</strong> estimated data broker exposures</p>
          </div>
          <div style="text-align: center; padding: 20px;">
            <a href="${frontendUrl}/remediation/${assessmentId}"
               style="background: #FFD700; color: #001F3F; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Remediation Steps
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

/**
 * @param {string} to
 * @param {string} code
 */
async function sendFamilyVerificationCode(to, code) {
  if (!ensureSendGrid()) {
    logger.warn("SendGrid not configured; skipping family email verification");
    return;
  }
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Verify family email — ProTechtable",
    text: `Your verification code is: ${code}. It expires in 15 minutes.`,
    html: `<p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;">${code}</p><p>Expires in 15 minutes.</p>`,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendExistingAccountEmail,
  sendAssessmentSummaryEmail,
  sendFamilyVerificationCode,
  isEmailConfigured,
};
