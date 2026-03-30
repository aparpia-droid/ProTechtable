function getBaseTemplate(content, frontendUrl) {
  const base = frontendUrl.replace(/\/$/, "");
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #001F3F; padding: 24px; text-align: center;">
        <h1 style="color: #FFD700; margin: 0; font-size: 24px;">ProTechtable</h1>
      </div>
      <div style="padding: 24px;">
        ${content}
      </div>
      <div style="padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #6B7280;">
        <p>You're receiving this because you have a ProTechtable account.</p>
        <p><a href="${base}/account" style="color: #001F3F;">Manage preferences</a> | <a href="${base}/privacy" style="color: #001F3F;">Privacy policy</a></p>
      </div>
    </div>
  `;
}

function quickWinsEmail({ firstName, assessmentId, quickWins, frontendUrl }) {
  const winsList = quickWins
    .map(
      (w) =>
        `<li style="margin-bottom: 8px;">${w.title} <span style="color: #6B7280; font-size: 14px;">(${w.timeEstimate})</span></li>`
    )
    .join("");
  return {
    subject: `${firstName || "Hey"}, here are your 3 quickest security wins`,
    html: getBaseTemplate(
      `
      <h2 style="color: #001F3F; margin-top: 0;">Your Quick Wins</h2>
      <p>Based on your assessment, these 3 actions have the biggest impact and take the least time:</p>
      <ol style="padding-left: 20px;">${winsList}</ol>
      <div style="text-align: center; padding: 20px 0;">
        <a href="${frontendUrl}/remediation/${assessmentId}" style="background: #FFD700; color: #001F3F; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Now</a>
      </div>
    `,
      frontendUrl
    ),
  };
}

function progressNudgeEmail({ firstName, completed, total, assessmentId, frontendUrl }) {
  const pct = Math.round((completed / total) * 100);
  return {
    subject: `You're ${pct}% protected — ${total - completed} actions left`,
    html: getBaseTemplate(
      `
      <h2 style="color: #001F3F; margin-top: 0;">Nice progress, ${firstName || "there"}!</h2>
      <p>You've completed <strong>${completed} of ${total}</strong> remediation actions.</p>
      <div style="background: #f3f4f6; border-radius: 8px; height: 24px; margin: 16px 0; overflow: hidden;">
        <div style="background: #22C55E; height: 100%; width: ${pct}%; border-radius: 8px;"></div>
      </div>
      <p>${total - completed} actions remaining. Each one makes your digital footprint smaller.</p>
      <div style="text-align: center; padding: 20px 0;">
        <a href="${frontendUrl}/remediation/${assessmentId}" style="background: #FFD700; color: #001F3F; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Continue</a>
      </div>
    `,
      frontendUrl
    ),
  };
}

function rescanReminderEmail({ firstName, lastScore, lastDate, frontendUrl, isPremium }) {
  const cta = isPremium
    ? `<a href="${frontendUrl}/assessment" style="background: #FFD700; color: #001F3F; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Run New Scan</a>`
    : `<a href="${frontendUrl}/pricing" style="background: #FFD700; color: #001F3F; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Upgrade for Unlimited Scans</a>`;
  return {
    subject: `It's been a month since your last security scan`,
    html: getBaseTemplate(
      `
      <h2 style="color: #001F3F; margin-top: 0;">Time for a check-up, ${firstName || "there"}</h2>
      <p>Your last scan on <strong>${lastDate}</strong> showed a score of <strong>${lastScore}/100</strong>.</p>
      <p>New breaches happen every day. A quick re-scan takes under a minute and shows what's changed.</p>
      <div style="text-align: center; padding: 20px 0;">${cta}</div>
    `,
      frontendUrl
    ),
  };
}

module.exports = { quickWinsEmail, progressNudgeEmail, rescanReminderEmail };
