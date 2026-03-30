describe("remediation prioritization", () => {
  function getActionPriority(actionType) {
    const priorities = {
      credit_freeze: 1,
      password_reset: 2,
      fraud_alert: 3,
      data_removal: 4,
    };
    return priorities[actionType] || 5;
  }

  test("credit freeze sorts before data removal", () => {
    expect(getActionPriority("credit_freeze")).toBeLessThan(getActionPriority("data_removal"));
  });
});
