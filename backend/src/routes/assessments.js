const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { assessmentEmailValidators, paramAssessmentId } = require("../utils/validators");
const { validate } = require("../middleware/validate");
const { assessmentLimiter } = require("../middleware/rateLimiter");
const { runAssessmentPipeline } = require("../services/assessmentRun");
const { sendAssessmentSummaryEmail } = require("../services/email");
const { prisma } = require("../utils/db");
const { sanitizeAssessmentData } = require("../utils/assessmentSanitize");
const { encrypt, decrypt } = require("../services/encryption");
const { logger } = require("../utils/logger");

const router = express.Router();

router.use(authMiddleware);

let enqueueAssessment;
try {
  if (process.env.REDIS_URL) {
    // eslint-disable-next-line global-require
    enqueueAssessment = require("../jobs/assessmentWorker").enqueueAssessment;
  }
} catch (e) {
  logger.warn("assessment_queue_init_failed", { message: e.message });
}

/**
 * @param {string} stored
 * @returns {string}
 */
function displayEmailSearched(stored) {
  if (!stored) return "";
  const d = decrypt(stored);
  return d != null ? d : stored;
}

/**
 * @param {import("@prisma/client").User} user
 * @param {string} emailNorm
 */
async function canUseEmailForAssessment(user, emailNorm) {
  if (emailNorm === user.email.toLowerCase()) return true;
  const extra = await prisma.userEmail.findFirst({
    where: {
      userId: user.id,
      email: emailNorm,
      verified: true,
    },
  });
  return Boolean(extra);
}

router.post("/create", assessmentLimiter, assessmentEmailValidators, validate, async (req, res, next) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;
    const emailNorm = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before running an assessment.",
      });
    }

    const allowed = await canUseEmailForAssessment(user, emailNorm);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You can only scan your own verified email address or verified family emails.",
      });
    }

    const hibpKey = process.env.HIBP_API_KEY || "";
    const shodanKey = process.env.SHODAN_API_KEY || "";
    const hunterKey = process.env.HUNTER_IO_API_KEY || "";
    const keys = { hibpKey, shodanKey, hunterKey };

    const encryptedStored = encrypt(email) || email;

    if (enqueueAssessment) {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          emailSearched: encryptedStored,
          score: 0,
          riskLevel: "pending",
          breachesFound: 0,
          dataBrokersFound: 0,
          publicProfiles: 0,
          assessmentData: {},
          status: "processing",
        },
      });
      await enqueueAssessment({
        assessmentId: assessment.id,
        userId,
        email,
        userEmail: user.email,
      });
      return res.json({
        success: true,
        data: {
          assessmentId: assessment.id,
          status: "processing",
        },
      });
    }

    const pipeline = await runAssessmentPipeline(email, keys);

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        emailSearched: encryptedStored,
        score: pipeline.scoreResult.totalScore,
        riskLevel: pipeline.scoreResult.riskLevel,
        breachesFound: pipeline.breachesFound,
        dataBrokersFound: pipeline.dataBrokersFound,
        publicProfiles: pipeline.publicProfiles,
        assessmentData: pipeline.assessmentData,
        status: "completed",
      },
    });

    try {
      await sendAssessmentSummaryEmail(user.email, {
        score: pipeline.scoreResult.totalScore,
        riskLevel: pipeline.scoreResult.riskLevel,
        breachesFound: pipeline.breachesFound,
        dataBrokersFound: pipeline.dataBrokersFound,
        assessmentId: assessment.id,
      });
    } catch {
      /* non-fatal */
    }

    return res.json({
      success: true,
      data: {
        assessmentId: assessment.id,
        status: "completed",
        score: pipeline.scoreResult.totalScore,
        riskLevel: pipeline.scoreResult.riskLevel,
        breachesFound: pipeline.breachesFound,
        dataBrokersFound: pipeline.dataBrokersFound,
        publicProfiles: pipeline.publicProfiles,
        breaches: pipeline.breaches,
        partialResults: pipeline.partialResults,
        apiWarnings: pipeline.apiWarnings,
        assessmentData: {
          scoreBreakdown: pipeline.assessmentData.scoreBreakdown,
          partialResults: pipeline.partialResults,
          apiWarnings: pipeline.apiWarnings,
        },
        emailRisk: pipeline.hunterResult.error
          ? { unavailable: true }
          : {
              status: pipeline.hunterResult.status,
              score: pipeline.hunterResult.score,
            },
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", paramAssessmentId(), validate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment || assessment.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    if (assessment.status === "processing" || assessment.status === "failed") {
      return res.json({
        success: true,
        data: {
          id: assessment.id,
          status: assessment.status,
          emailSearched: displayEmailSearched(assessment.emailSearched),
          createdAt: assessment.createdAt,
        },
      });
    }

    const data = assessment.assessmentData || {};
    const breachList = Array.isArray(data.hibpBreachList) ? data.hibpBreachList : [];
    const breaches =
      breachList.length > 0
        ? breachList
        : Array.isArray(data.hibp?.breachNames)
          ? data.hibp.breachNames.map((n) => ({ name: n }))
          : [];

    return res.json({
      success: true,
      data: {
        id: assessment.id,
        status: assessment.status || "completed",
        emailSearched: displayEmailSearched(assessment.emailSearched),
        score: assessment.score,
        riskLevel: assessment.riskLevel,
        breachesFound: assessment.breachesFound,
        dataBrokersFound: assessment.dataBrokersFound,
        publicProfiles: assessment.publicProfiles,
        assessmentData: sanitizeAssessmentData(data),
        createdAt: assessment.createdAt,
        breaches,
        partialResults: Boolean(data.partialResults),
        apiWarnings: data.apiWarnings || [],
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
