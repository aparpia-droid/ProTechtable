const https = require("https");
const { logger } = require("../utils/logger");

const TIMEOUT_MS = 10000;

/**
 * Search Shodan for email exposure; returns total match count as public profile proxy.
 * @param {string} email
 * @param {string} apiKey
 * @returns {Promise<{ total: number, raw?: object, error?: string }>}
 */
async function searchEmail(email, apiKey) {
  if (!apiKey) {
    return { total: 0, error: "Shodan not configured" };
  }
  const query = encodeURIComponent(`"${email}"`);
  const key = encodeURIComponent(apiKey);
  const path = `/shodan/host/search?key=${key}&query=${query}`;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.shodan.io",
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
              logger.warn("Shodan API non-success", { statusCode: res.statusCode });
              resolve({ total: 0, error: "shodan_unavailable" });
              return;
            }
            const json = JSON.parse(data);
            const total = typeof json.total === "number" ? json.total : 0;
            resolve({ total, raw: { total, matches: Array.isArray(json.matches) ? json.matches.length : 0 } });
          } catch (e) {
            logger.warn("Shodan parse error", { message: e.message });
            resolve({ total: 0, error: "shodan_parse_error" });
          }
        });
      }
    );
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", (e) => {
      logger.warn("Shodan request failed", { message: e.message });
      resolve({ total: 0, error: e.message });
    });
    req.end();
  });
}

module.exports = { searchEmail };
