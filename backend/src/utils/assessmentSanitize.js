/**
 * Whitelist fields returned to clients from stored assessment JSON.
 * @param {object} data
 * @returns {object}
 */
function sanitizeAssessmentData(data) {
  const raw = data || {};
  const breachSource = Array.isArray(raw.hibpBreachList) ? raw.hibpBreachList : [];
  const breaches = breachSource.map((b) => ({
    name: b.Name || b.name,
    domain: b.Domain || b.domain,
    breachDate: b.BreachDate || b.breachDate,
    dataClasses: b.DataClasses || b.dataTypes || b.dataClasses || [],
    description: b.Description || b.description,
  }));

  let emailRisk = "unknown";
  if (raw.hunter?.error) {
    emailRisk = { unavailable: true };
  } else if (raw.hunter && typeof raw.hunter === "object") {
    if (raw.hunter.status != null || raw.hunter.score != null) {
      emailRisk = { status: raw.hunter.status, score: raw.hunter.score };
    }
  }

  return {
    breaches,
    publicProfiles: raw.shodan?.total ?? 0,
    emailRisk,
    apiWarnings: raw.apiWarnings || [],
    partialResults: Boolean(raw.partialResults),
    scoreBreakdown: raw.scoreBreakdown || null,
  };
}

module.exports = { sanitizeAssessmentData };
