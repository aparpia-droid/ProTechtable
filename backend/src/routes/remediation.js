const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { paramRemediationAssessmentId, markActionValidators } = require("../utils/validators");
const { validate } = require("../middleware/validate");
const { prisma } = require("../utils/db");

const planRouter = express.Router();
const actionsRouter = express.Router();

planRouter.use(authMiddleware);
actionsRouter.use(authMiddleware);

/**
 * @param {string} actionType
 * @returns {number}
 */
function getActionPriority(actionType) {
  const priorities = {
    credit_freeze: 1,
    password_reset: 2,
    fraud_alert: 3,
    data_removal: 4,
  };
  return priorities[actionType] || 5;
}

/**
 * @param {string} actionType
 * @param {string} target
 * @returns {{ title: string, description: string, priority: string, difficulty: string, timeEstimate: string }}
 */
function metaForAction(actionType, target) {
  switch (actionType) {
    case "password_reset":
      return {
        title: `Change password for ${target}`,
        description:
          "If you reused this password elsewhere, update it there too. Use a unique strong password or a password manager.",
        priority: "High",
        difficulty: "Easy",
        timeEstimate: "15 min",
      };
    case "credit_freeze":
      return {
        title: "Place a credit freeze",
        description:
          "Contact Equifax, Experian, and TransUnion to freeze your credit and block new account openings.",
        priority: "High",
        difficulty: "Medium",
        timeEstimate: "45 min",
      };
    case "fraud_alert":
      return {
        title: "Set up fraud alerts",
        description:
          "File an FTC identity theft report and consider placing a fraud alert with credit bureaus.",
        priority: "Medium",
        difficulty: "Easy",
        timeEstimate: "30 min",
      };
    case "data_removal":
      return {
        title: `Remove data from ${target}`,
        description: "Submit an opt-out request to this data broker using their removal process.",
        priority: "Medium",
        difficulty: "Medium",
        timeEstimate: "20 min",
      };
    default:
      return {
        title: target,
        description: "Complete this remediation step.",
        priority: "Medium",
        difficulty: "Medium",
        timeEstimate: "20 min",
      };
  }
}

/**
 * @param {string} userId
 * @param {import("@prisma/client").Assessment} assessment
 * @returns {object[]}
 */
function buildRemediationRows(userId, assessment) {
  const data = assessment.assessmentData || {};
  const breachNames = Array.isArray(data.hibp?.breachNames) ? data.hibp.breachNames : [];
  const uniqueBreaches = [...new Set(breachNames)];

  const brokerLimit = Math.min(assessment.dataBrokersFound || 0, 20);

  const rows = [];

  for (const name of uniqueBreaches) {
    rows.push({
      userId,
      assessmentId: assessment.id,
      actionType: "password_reset",
      actionTarget: name,
      status: "pending",
      isAutomated: false,
    });
  }

  rows.push({
    userId,
    assessmentId: assessment.id,
    actionType: "credit_freeze",
    actionTarget: "Equifax, Experian, TransUnion",
    status: "pending",
    isAutomated: false,
  });

  rows.push({
    userId,
    assessmentId: assessment.id,
    actionType: "fraud_alert",
    actionTarget: "FTC & credit bureaus",
    status: "pending",
    isAutomated: false,
  });

  return { rows, brokerLimit };
}

async function ensureRemediationActions(userId, assessment) {
  await prisma.$transaction(async (tx) => {
    const count = await tx.remediationAction.count({ where: { assessmentId: assessment.id } });
    if (count > 0) return;

    const { rows, brokerLimit } = buildRemediationRows(userId, assessment);
    const brokers = await tx.dataBroker.findMany({
      orderBy: { name: "asc" },
      take: brokerLimit > 0 ? brokerLimit : 0,
    });

    const allRows = [...rows];
    for (const b of brokers) {
      allRows.push({
        userId,
        assessmentId: assessment.id,
        actionType: "data_removal",
        actionTarget: b.name,
        status: "pending",
        isAutomated: false,
      });
    }

    if (allRows.length) {
      await tx.remediationAction.createMany({ data: allRows });
    }
  });
}

planRouter.get("/:assessmentId", paramRemediationAssessmentId(), validate, async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment || assessment.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Assessment not found" });
    }

    await ensureRemediationActions(req.user.id, assessment);

    const actions = await prisma.remediationAction.findMany({
      where: { assessmentId },
      orderBy: { createdAt: "asc" },
    });

    const brokerRows = await prisma.dataBroker.findMany();
    const brokerMap = Object.fromEntries(brokerRows.map((b) => [b.name, b]));

    let enriched = actions.map((a) => {
      const m = metaForAction(a.actionType, a.actionTarget);
      const broker = a.actionType === "data_removal" ? brokerMap[a.actionTarget] : null;
      return {
        id: a.id,
        actionType: a.actionType,
        actionTarget: a.actionTarget,
        status: a.status,
        isAutomated: a.isAutomated,
        title: m.title,
        description: m.description,
        priority: m.priority,
        difficulty: broker?.difficulty || m.difficulty,
        timeEstimate: m.timeEstimate,
        removalUrl: broker?.removalUrl || null,
        removalMethod: broker?.removalMethod || null,
      };
    });

    enriched.sort((a, b) => getActionPriority(a.actionType) - getActionPriority(b.actionType));

    const completed = actions.filter((a) => a.status === "completed").length;
    const total = actions.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    return res.json({
      success: true,
      remediationPlan: {
        actions: enriched,
        progress: { total, completed, percentage },
      },
    });
  } catch (e) {
    next(e);
  }
});

actionsRouter.post("/mark-complete", markActionValidators, validate, async (req, res, next) => {
  try {
    const { actionId } = req.body;
    const action = await prisma.remediationAction.findUnique({
      where: { id: actionId },
    });
    if (!action || action.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Action not found" });
    }
    await prisma.remediationAction.update({
      where: { id: actionId },
      data: { status: "completed", completedAt: new Date() },
    });
    return res.json({ success: true, message: "Marked complete" });
  } catch (e) {
    next(e);
  }
});

module.exports = { planRouter, actionsRouter };
