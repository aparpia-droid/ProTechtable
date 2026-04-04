const express = require("express");
const { assessmentLimiter } = require("../middleware/rateLimiter");
const { logger } = require("../utils/logger");

const router = express.Router();

function buildDataClassesSummary(breaches) {
  return [...new Set(breaches.flatMap((b) => b.DataClasses || []))].slice(0, 8);
}

router.post("/check", assessmentLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email required" });
    }

    const HIBP_KEY = process.env.HIBP_API_KEY;
    if (!HIBP_KEY) {
      return res.status(503).json({ success: false, message: "Service temporarily unavailable" });
    }

    const encoded = encodeURIComponent(email.trim());
    const resp = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encoded}?truncateResponse=false`,
      {
        headers: {
          "hibp-api-key": HIBP_KEY,
          "user-agent": "ProTechtable",
        },
      }
    );

    if (resp.status === 404) {
      return res.json({
        success: true,
        data: {
          breachCount: 0,
          breaches: [],
          riskScore: 5,
          brokerEstimate: 0,
          totalBreaches: 0,
          previewOnly: true,
          exposedAccounts: 0,
          passwordsLeaked: false,
          dataClassSummary: [],
        },
      });
    }

    if (!resp.ok) {
      logger.error("HIBP API error", { status: resp.status });
      return res.status(502).json({ success: false, message: "Scan service error" });
    }

    const raw = await resp.json();
    const breaches = Array.isArray(raw) ? raw : [];
    const breachCount = breaches.length;

    let riskScore = Math.min(100, breachCount * 8 + 10);
    const hasPassword = breaches.some((b) => (b.DataClasses || []).includes("Passwords"));
    if (hasPassword) riskScore = Math.min(100, riskScore + 20);

    let brokerEstimate = 0;
    if (breachCount > 5) brokerEstimate = 30;
    else if (breachCount >= 3) brokerEstimate = 20;
    else if (breachCount >= 1) brokerEstimate = 8;

    const preview = breaches.slice(0, 3).map((b) => ({
      name: b.Name,
      date: b.BreachDate,
      dataClasses: (b.DataClasses || []).slice(0, 5),
    }));

    const dataClassSummary = buildDataClassesSummary(breaches);

    return res.json({
      success: true,
      data: {
        breachCount,
        breaches: preview,
        riskScore,
        brokerEstimate,
        totalBreaches: breachCount,
        previewOnly: true,
        exposedAccounts: breachCount,
        passwordsLeaked: hasPassword,
        dataClassSummary,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
