const https = require("https");
const { logger } = require("../utils/logger");

const TIMEOUT_MS = 10000;

/**
 * @param {string} path
 * @param {Record<string,string>} headers
 * @returns {Promise<{ statusCode: number, body: string }>}
 */
function request(path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "haveibeenpwned.com",
        path,
        method: "GET",
        headers: {
          "User-Agent": "ProTechtable/1.0",
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => resolve({ statusCode: res.statusCode || 0, body: data }));
      }
    );
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error("HIBP request timeout"));
    });
    req.on("error", reject);
    req.end();
  });
}

/**
 * Normalize breach entries for API response and storage.
 * @param {object} b
 * @returns {{ name: string, title?: string, breachDate?: string, dataClasses?: string[] }}
 */
function mapBreach(b) {
  if (!b || typeof b !== "object") return { name: String(b) };
  return {
    name: b.Name || b.name || "Unknown",
    title: b.Title,
    breachDate: b.BreachDate,
    dataClasses: Array.isArray(b.DataClasses) ? b.DataClasses : undefined,
  };
}

/**
 * Fetch breached account data (v3 returns breach objects).
 * @param {string} email
 * @param {string} apiKey
 * @returns {Promise<{ breaches: object[], breachNames: string[], error?: string }>}
 */
async function getBreachesForEmail(email, apiKey) {
  if (!apiKey) {
    return { breaches: [], breachNames: [], error: "HIBP not configured" };
  }
  const encoded = encodeURIComponent(email);
  try {
    const { statusCode, body } = await request(`/api/v3/breachedaccount/${encoded}`, {
      "hibp-api-key": apiKey,
    });
    if (statusCode === 404) {
      return { breaches: [], breachNames: [] };
    }
    if (statusCode !== 200) {
      logger.warn("HIBP breached account returned non-success", { statusCode });
      return { breaches: [], breachNames: [], error: "hibp_unavailable" };
    }
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) {
      return { breaches: [], breachNames: [], error: "hibp_invalid_response" };
    }

    /** @type {object[]} */
    let breachObjects = [];
    if (parsed.length && typeof parsed[0] === "string") {
      breachObjects = parsed.slice(0, 10).map((name) => ({ Name: name }));
    } else {
      breachObjects = parsed.slice(0, 10);
    }

    const breachNames = breachObjects
      .map((b) => (typeof b === "string" ? b : b.Name))
      .filter(Boolean);

    const needsDetail = breachObjects.some((b) => b && typeof b === "object" && !b.BreachDate && !b.DataClasses);
    let details = breachObjects.map(mapBreach);

    if (needsDetail && breachNames.length) {
      const enriched = [];
      for (const name of breachNames.slice(0, 10)) {
        try {
          const detailRes = await request(`/api/v3/breach/${encodeURIComponent(name)}`, {
            "hibp-api-key": apiKey,
          });
          if (detailRes.statusCode === 200) {
            enriched.push(mapBreach(JSON.parse(detailRes.body)));
          } else {
            enriched.push({ name });
          }
        } catch (e) {
          logger.warn("HIBP breach detail fetch failed", { message: e.message });
          enriched.push({ name });
        }
      }
      details = enriched;
    } else {
      details = breachObjects.map(mapBreach);
    }

    return { breaches: details, breachNames };
  } catch (e) {
    logger.warn("HIBP breached account failed", { message: e.message });
    return { breaches: [], breachNames: [], error: e.message };
  }
}

module.exports = { getBreachesForEmail };
