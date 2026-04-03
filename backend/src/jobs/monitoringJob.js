const { prisma } = require("../utils/db");
const { logger } = require("../utils/logger");
const { getBreachesForEmail } = require("../services/hibp");
const { sendMonitoringAlert } = require("../services/email");

/**
 * Weekly monitoring job: re-scans users with monitoring enabled
 * and creates alerts for new breaches vs. the last assessment snapshot.
 */
async function runMonitoringJob() {
  const users = await prisma.user.findMany({
    where: {
      monitoringEnabled: true,
      emailVerified: true,
    },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  logger.info("monitoring_job_started", { userCount: users.length });

  const hibpKey = process.env.HIBP_API_KEY || "";

  for (const user of users) {
    try {
      const lastAssessment = user.assessments[0];
      if (!lastAssessment) continue;

      if (!hibpKey) {
        logger.warn("monitoring_job_skip_no_hibp", { userId: user.id });
        continue;
      }

      const lastBreaches = lastAssessment.assessmentData?.breaches || [];
      const lastBreachNames = new Set(
        lastBreaches.map((b) => (typeof b === "string" ? b : b.name || b.Name)).filter(Boolean)
      );

      const hibpResult = await getBreachesForEmail(user.email, hibpKey);

      await new Promise((r) => setTimeout(r, 1600));

      const currentBreaches = Array.isArray(hibpResult.breaches) ? hibpResult.breaches : [];
      const newBreaches = currentBreaches.filter((b) => {
        const n = b.name || b.Name;
        return n && !lastBreachNames.has(n);
      });

      if (newBreaches.length > 0) {
        await prisma.monitoringAlert.create({
          data: {
            userId: user.id,
            type: "new_breach",
            title: `${newBreaches.length} new breach${newBreaches.length > 1 ? "es" : ""} detected`,
            description: `Your email was found in ${newBreaches.length} new data breach${
              newBreaches.length > 1 ? "es" : ""
            }: ${newBreaches.map((b) => b.name || b.Name).join(", ")}. Run a new assessment for full details.`,
            metadata: { breaches: newBreaches.map((b) => b.name || b.Name) },
          },
        });

        try {
          await sendMonitoringAlert(user.email, {
            firstName: user.firstName,
            newBreachCount: newBreaches.length,
            breachNames: newBreaches.map((b) => b.name || b.Name),
          });
        } catch (emailErr) {
          logger.warn("monitoring_alert_email_failed", { error: emailErr.message, userId: user.id });
        }

        logger.info("new_breaches_detected", { userId: user.id, count: newBreaches.length });
      }
    } catch (err) {
      logger.warn("monitoring_scan_failed", { userId: user.id, error: err.message });
    }
  }

  logger.info("monitoring_job_completed");
}

module.exports = { runMonitoringJob };
