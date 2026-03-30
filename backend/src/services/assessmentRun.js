const { getBreachesForEmail } = require("./hibp");
const { searchEmail } = require("./shodan");
const { verifyEmail } = require("./hunter");
const { calculateScore, estimateDataBrokers } = require("./scoring");

const ASSESSMENT_TIMEOUT_MS = 55000;

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {T} fallback
 */
function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Run external API calls with a 55s cap each (overall wall clock ~55s via Promise.all).
 * @param {string} email
 * @param {{ hibpKey: string, shodanKey: string, hunterKey: string }} keys
 */
async function runAssessmentPipeline(email, keys) {
  const { hibpKey, shodanKey, hunterKey } = keys;

  const [hibpResult, shodanResult, hunterResult] = await Promise.all([
    withTimeout(
      getBreachesForEmail(email, hibpKey),
      ASSESSMENT_TIMEOUT_MS,
      {
        breaches: [],
        breachNames: [],
        error: "Timeout: breach check took too long",
      }
    ),
    withTimeout(
      searchEmail(email, shodanKey),
      ASSESSMENT_TIMEOUT_MS,
      { total: 0, error: "Timeout: profile scan took too long" }
    ),
    withTimeout(
      verifyEmail(email, hunterKey),
      ASSESSMENT_TIMEOUT_MS,
      { error: "Timeout: email verification took too long" }
    ),
  ]);

  const breachesFound = hibpResult.breachNames ? hibpResult.breachNames.length : 0;
  const publicProfiles = shodanResult.total || 0;
  const dataBrokersFound = estimateDataBrokers(breachesFound);

  const hunterForScore = hunterResult.error
    ? null
    : { status: hunterResult.status, score: hunterResult.score };

  const scoreResult = calculateScore({
    breachesFound,
    publicProfiles,
    dataBrokersFound,
    hunterResult: hunterForScore,
  });

  const apiWarnings = [];
  if (hibpResult.error) apiWarnings.push("Breach database temporarily unavailable");
  if (shodanResult.error) apiWarnings.push("Public profile scan temporarily unavailable");
  if (hunterResult.error) apiWarnings.push("Email verification temporarily unavailable");

  const partialResults = apiWarnings.length > 0;

  const breaches = (hibpResult.breaches || []).map((b) => ({
    name: b.name,
    title: b.title,
    breachDate: b.breachDate,
    dataTypes: b.dataClasses || [],
  }));

  const assessmentData = {
    hibp: { breachNames: hibpResult.breachNames, error: hibpResult.error },
    hibpBreachList: breaches,
    shodan: { total: publicProfiles, error: shodanResult.error },
    hunter: hunterResult.error ? { error: hunterResult.error } : hunterResult.raw || hunterResult,
    apiWarnings,
    partialResults,
    scoreBreakdown: {
      breachScore: scoreResult.breachScore,
      profileScore: scoreResult.profileScore,
      brokerScore: scoreResult.brokerScore,
      emailRiskScore: scoreResult.emailRiskScore,
    },
  };

  return {
    breachesFound,
    publicProfiles,
    dataBrokersFound,
    scoreResult,
    breaches,
    assessmentData,
    partialResults,
    apiWarnings,
    hunterResult,
  };
}

module.exports = {
  runAssessmentPipeline,
  ASSESSMENT_TIMEOUT_MS,
  withTimeout,
};
