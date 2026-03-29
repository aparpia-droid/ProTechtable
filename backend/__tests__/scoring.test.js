const { calculateScore, estimateDataBrokers } = require("../src/services/scoring");

describe("scoring", () => {
  test("zero breaches yields low score", () => {
    const r = calculateScore({
      breachesFound: 0,
      publicProfiles: 0,
      dataBrokersFound: 0,
      hunterResult: { status: "valid", score: 100 },
    });
    expect(r.totalScore).toBe(0);
    expect(r.riskLevel).toBe("low");
  });

  test("max breaches caps breachScore at 40", () => {
    const r = calculateScore({
      breachesFound: 10,
      publicProfiles: 0,
      dataBrokersFound: 0,
      hunterResult: null,
    });
    expect(r.breachScore).toBe(40);
  });

  test("public profiles scale and cap at 30", () => {
    const r = calculateScore({
      breachesFound: 0,
      publicProfiles: 100,
      dataBrokersFound: 0,
      hunterResult: null,
    });
    expect(r.profileScore).toBe(30);
  });

  test("broker score caps at 20", () => {
    const r = calculateScore({
      breachesFound: 0,
      publicProfiles: 0,
      dataBrokersFound: 10,
      hunterResult: null,
    });
    expect(r.brokerScore).toBe(20);
  });

  test("email risk adds 10 when invalid or low score", () => {
    const a = calculateScore({
      breachesFound: 0,
      publicProfiles: 0,
      dataBrokersFound: 0,
      hunterResult: { status: "invalid", score: 0 },
    });
    expect(a.emailRiskScore).toBe(10);
    const b = calculateScore({
      breachesFound: 0,
      publicProfiles: 0,
      dataBrokersFound: 0,
      hunterResult: { status: "valid", score: 40 },
    });
    expect(b.emailRiskScore).toBe(10);
  });

  test("risk levels", () => {
    expect(
      calculateScore({
        breachesFound: 0,
        publicProfiles: 0,
        dataBrokersFound: 0,
        hunterResult: null,
      }).riskLevel
    ).toBe("low");
    expect(
      calculateScore({
        breachesFound: 2,
        publicProfiles: 0,
        dataBrokersFound: 0,
        hunterResult: null,
      }).totalScore
    ).toBeGreaterThanOrEqual(26);
  });

  test("estimateDataBrokers heuristic", () => {
    expect(estimateDataBrokers(0)).toBe(0);
    expect(estimateDataBrokers(4)).toBe(10);
    expect(estimateDataBrokers(100)).toBe(20);
  });
});
