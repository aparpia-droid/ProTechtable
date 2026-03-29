const express = require("express");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");
const { assessmentEmailValidators, paramAssessmentId } = require("../utils/validators");
const { getBreachesForEmail } = require("../services/hibp");
const { searchEmail } = require("../services/shodan");
const { verifyEmail } = require("../services/hunter");
const { calculateScore, estimateDataBrokers } = require("../services/scoring");

const prisma = new PrismaClient();
const router = express.Router();

router.use(authMiddleware);

router.post("/create", assessmentEmailValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { email } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.subscriptionTier !== "premium") {
      const count = await prisma.assessment.count({ where: { userId } });
      if (count >= 1) {
        return res.status(403).json({
          success: false,
          message: "Free tier allows one assessment. Upgrade to Premium for unlimited scans.",
        });
      }
    }

    const hibpKey = process.env.HIBP_API_KEY || "";
    const shodanKey = process.env.SHODAN_API_KEY || "";
    const hunterKey = process.env.HUNTER_IO_API_KEY || "";

    const [hibpResult, shodanResult, hunterResult] = await Promise.all([
      getBreachesForEmail(email, hibpKey),
      searchEmail(email, shodanKey),
      verifyEmail(email, hunterKey),
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
    };

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        emailSearched: email,
        score: scoreResult.totalScore,
        riskLevel: scoreResult.riskLevel,
        breachesFound,
        dataBrokersFound,
        publicProfiles,
        assessmentData,
      },
    });

    return res.json({
      success: true,
      data: {
        assessmentId: assessment.id,
        score: scoreResult.totalScore,
        riskLevel: scoreResult.riskLevel,
        breachesFound,
        dataBrokersFound,
        publicProfiles,
        breaches,
        emailRisk: hunterResult.error
          ? { unavailable: true }
          : {
              status: hunterResult.status,
              score: hunterResult.score,
            },
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", paramAssessmentId(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    const { id } = req.params;
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment || assessment.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
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
        emailSearched: assessment.emailSearched,
        score: assessment.score,
        riskLevel: assessment.riskLevel,
        breachesFound: assessment.breachesFound,
        dataBrokersFound: assessment.dataBrokersFound,
        publicProfiles: assessment.publicProfiles,
        assessmentData: assessment.assessmentData,
        createdAt: assessment.createdAt,
        breaches,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
