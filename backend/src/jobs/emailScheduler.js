const sgMail = require("@sendgrid/mail");
const { prisma } = require("../utils/db");
const { logger } = require("../utils/logger");
const { quickWinsEmail, progressNudgeEmail, rescanReminderEmail } = require("../services/emailTemplates");

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

async function runEmailJobs() {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    logger.warn("SendGrid not configured; skipping scheduled emails");
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const from = process.env.SENDGRID_FROM_EMAIL;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const recentAssessments = await prisma.assessment.findMany({
    where: {
      createdAt: { gte: twoDaysAgo, lte: oneDayAgo },
      quickWinsEmailSentAt: null,
      status: "completed",
    },
    include: {
      user: true,
      remediationActions: true,
    },
  });

  for (const assessment of recentAssessments) {
    const completed = assessment.remediationActions.filter((a) => a.status === "completed").length;
    if (completed > 0) continue;
    if (!assessment.user.email) continue;

    const quickWins = assessment.remediationActions
      .filter((a) => a.status === "pending")
      .slice(0, 3)
      .map((a) => ({ title: a.actionTarget, timeEstimate: "5-10 min" }));

    if (quickWins.length === 0) continue;

    try {
      const { subject, html } = quickWinsEmail({
        firstName: assessment.user.firstName,
        assessmentId: assessment.id,
        quickWins,
        frontendUrl: FRONTEND_URL,
      });
      await sgMail.send({ to: assessment.user.email, from, subject, html });
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { quickWinsEmailSentAt: new Date() },
      });
      logger.info("quick_wins_email_sent", { userId: assessment.user.id });
    } catch (err) {
      logger.warn("quick_wins_email_failed", { error: err.message });
    }
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  const weekOldAssessments = await prisma.assessment.findMany({
    where: {
      createdAt: { gte: eightDaysAgo, lte: sevenDaysAgo },
      progressNudgeSentAt: null,
      status: "completed",
    },
    include: { user: true, remediationActions: true },
  });

  for (const assessment of weekOldAssessments) {
    const total = assessment.remediationActions.length;
    const completed = assessment.remediationActions.filter((a) => a.status === "completed").length;
    if (total === 0 || completed === total) continue;

    try {
      const { subject, html } = progressNudgeEmail({
        firstName: assessment.user.firstName,
        completed,
        total,
        assessmentId: assessment.id,
        frontendUrl: FRONTEND_URL,
      });
      await sgMail.send({ to: assessment.user.email, from, subject, html });
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { progressNudgeSentAt: new Date() },
      });
      logger.info("progress_nudge_sent", { userId: assessment.user.id });
    } catch (err) {
      logger.warn("progress_nudge_failed", { error: err.message });
    }
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

  const oldAssessments = await prisma.assessment.findMany({
    where: {
      createdAt: { gte: thirtyOneDaysAgo, lte: thirtyDaysAgo },
      rescanReminderSentAt: null,
      status: "completed",
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const latestByUser = new Map();
  for (const a of oldAssessments) {
    if (!latestByUser.has(a.userId)) {
      latestByUser.set(a.userId, a);
    }
  }

  for (const assessment of latestByUser.values()) {
    try {
      const { subject, html } = rescanReminderEmail({
        firstName: assessment.user.firstName,
        lastScore: assessment.score,
        lastDate: new Date(assessment.createdAt).toLocaleDateString(),
        frontendUrl: FRONTEND_URL,
        isPremium: assessment.user.subscriptionTier === "premium",
      });
      await sgMail.send({ to: assessment.user.email, from, subject, html });
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { rescanReminderSentAt: new Date() },
      });
      logger.info("rescan_reminder_sent", { userId: assessment.user.id });
    } catch (err) {
      logger.warn("rescan_reminder_failed", { error: err.message });
    }
  }
}

module.exports = { runEmailJobs };
