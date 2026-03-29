/**
 * Compute vulnerability score and risk level from assessment inputs.
 * @param {object} params
 * @param {number} params.breachesFound
 * @param {number} params.publicProfiles
 * @param {number} params.dataBrokersFound
 * @param {{ status?: string, score?: number } | null} params.hunterResult
 * @returns {{ totalScore: number, riskLevel: string, breachScore: number, profileScore: number, brokerScore: number, emailRiskScore: number }}
 */
function calculateScore({ breachesFound, publicProfiles, dataBrokersFound, hunterResult }) {
  const b = Math.max(0, Number(breachesFound) || 0);
  const p = Math.max(0, Number(publicProfiles) || 0);
  const db = Math.max(0, Number(dataBrokersFound) || 0);

  const breachScore = Math.min(b * 20, 40);
  const profileScore = Math.min(Math.floor(p / 10) * 15, 30);
  const brokerScore = Math.min(db * 5, 20);

  let emailRiskScore = 0;
  if (hunterResult) {
    const status = hunterResult.status;
    const score = hunterResult.score;
    if (status === "invalid" || (typeof score === "number" && score < 50)) {
      emailRiskScore = 10;
    }
  }

  const totalScore = Math.min(100, breachScore + profileScore + brokerScore + emailRiskScore);

  let riskLevel = "low";
  if (totalScore >= 76) riskLevel = "critical";
  else if (totalScore >= 51) riskLevel = "high";
  else if (totalScore >= 26) riskLevel = "medium";

  return {
    totalScore,
    riskLevel,
    breachScore,
    profileScore,
    brokerScore,
    emailRiskScore,
  };
}

/**
 * Heuristic broker count for MVP.
 * @param {number} breachesFound
 * @returns {number}
 */
function estimateDataBrokers(breachesFound) {
  const b = Math.max(0, Number(breachesFound) || 0);
  return Math.min(Math.floor(b * 2.5), 20);
}

module.exports = { calculateScore, estimateDataBrokers };
