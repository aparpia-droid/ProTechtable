const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { prisma } = require("../utils/db");
const { logger } = require("../utils/logger");

const router = express.Router();
router.use(authMiddleware);

router.get("/my-campus", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.isStudent) {
      return res.status(403).json({
        success: false,
        message: "Campus reports are available for .edu accounts only",
      });
    }

    const parts = user.email.split("@");
    if (parts.length < 2) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const domain = parts[1].toLowerCase();

    const domainUsers = await prisma.user.count({
      where: { email: { endsWith: `@${domain}` }, emailVerified: true },
    });

    const assessments = await prisma.assessment.findMany({
      where: {
        user: { email: { endsWith: `@${domain}` } },
        status: "completed",
      },
      select: { score: true, breachesFound: true },
    });

    const breachedCount = assessments.filter((a) => a.breachesFound > 0).length;
    const avgScore =
      assessments.length > 0
        ? Math.round(assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length)
        : 0;

    let report = await prisma.campusReport.findFirst({
      where: { domain },
      orderBy: { generatedAt: "desc" },
    });

    const uniName = domain
      .replace(/\.edu$/i, "")
      .split(".")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

    const stale = !report || Date.now() - new Date(report.generatedAt).getTime() > 86400000;
    if (stale) {
      try {
        report = await prisma.campusReport.create({
          data: {
            domain,
            universityName: uniName,
            totalUsers: domainUsers,
            breachedUsers: breachedCount,
            avgRiskScore: avgScore,
          },
        });
      } catch (e) {
        logger.warn("campus_report_create_failed", { message: e.message });
        report = {
          universityName: uniName,
          domain,
          totalUsers: domainUsers,
          breachedUsers: breachedCount,
          avgRiskScore: avgScore,
          generatedAt: new Date(),
        };
      }
    }

    const totalStudents = report.totalUsers;
    const breachedUsers = report.breachedUsers;
    const avgRiskScore = report.avgRiskScore;

    return res.json({
      success: true,
      data: {
        university: report.universityName,
        domain: report.domain,
        totalStudents,
        studentsWithBreaches: breachedUsers,
        breachPercentage:
          totalStudents > 0 ? Math.round((breachedUsers / totalStudents) * 100) : 0,
        avgRiskScore,
        generatedAt: report.generatedAt,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
