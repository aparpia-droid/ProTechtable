const https = require("https");
const { logger } = require("../utils/logger");

const TIMEOUT_MS = 8000;

/**
 * Verify email via Hunter.io and return risk-related fields.
 * @param {string} email
 * @param {string} apiKey
 * @returns {Promise<{ status?: string, score?: number, raw?: object, error?: string }>}
 */
async function verifyEmail(email, apiKey) {
  if (!apiKey) {
    return { error: "Hunter not configured" };
  }
  const e = encodeURIComponent(email);
  const k = encodeURIComponent(apiKey);
  const path = `/v2/email-verifier?email=${e}&api_key=${k}`;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.hunter.io",
        path,
        method: "GET",
        headers: { "User-Agent": "ProTechtable/1.0" },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          try {
            if (res.statusCode !== 200) {
              logger.warn("Hunter API non-success", { statusCode: res.statusCode });
              resolve({ error: "hunter_unavailable" });
              return;
            }
            const json = JSON.parse(data);
            const d = json.data || json;
            const status = d.status;
            const score = typeof d.score === "number" ? d.score : undefined;
            resolve({ status, score, raw: d });
          } catch (e2) {
            logger.warn("Hunter parse error", { message: e2.message });
            resolve({ error: "hunter_parse_error" });
          }
        });
      }
    );
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", (e) => {
      logger.warn("Hunter request failed", { message: e.message });
      resolve({ error: e.message });
    });
    req.end();
  });
}

module.exports = { verifyEmail };
