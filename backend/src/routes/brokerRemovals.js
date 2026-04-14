const express = require("express");
const { prisma } = require("../utils/db");
const { authMiddleware } = require("../middleware/auth");
const { logger } = require("../utils/logger");
const { sendBrokerRemovalEmail } = require("../services/email");

const router = express.Router();

router.use(authMiddleware);

// GET /api/broker-removals — get all broker removal statuses for the user
router.get("/", async (req, res, next) => {
  try {
    const brokers = await prisma.dataBroker.findMany({ orderBy: { name: "asc" } });
    const removals = await prisma.brokerRemoval.findMany({
      where: { userId: req.user.id },
    });

    const removalMap = new Map(removals.map((r) => [r.brokerId, r]));
    const isPremium =
      process.env.UNLOCK_ALL_FEATURES === "true" || req.user.subscriptionTier === "premium";

    const data = brokers.map((b) => {
      const removal = removalMap.get(b.id);
      return {
        id: b.id,
        name: b.name,
        removalMethod: b.removalMethod,
        difficulty: b.difficulty,
        category: b.category,
        dataTypes: b.dataTypes ? b.dataTypes.split(",") : [],
        estimatedDays: b.estimatedDays,
        removalUrl: isPremium ? b.removalUrl : null,
        locked: !isPremium,
        removal: removal
          ? {
              id: removal.id,
              status: removal.status,
              requestedAt: removal.requestedAt,
              submittedAt: removal.submittedAt,
              confirmedAt: removal.confirmedAt,
              nextFollowUp: removal.nextFollowUp,
            }
          : null,
      };
    });

    const stats = {
      total: brokers.length,
      notStarted: brokers.length - removals.length,
      requested: removals.filter((r) => r.status === "requested").length,
      submitted: removals.filter((r) => r.status === "submitted").length,
      confirmed: removals.filter((r) => r.status === "confirmed").length,
      failed: removals.filter((r) => r.status === "failed").length,
    };

    return res.json({ success: true, data, stats });
  } catch (e) {
    next(e);
  }
});

// POST /api/broker-removals/:brokerId/request — initiate removal for a broker
router.post("/:brokerId/request", async (req, res, next) => {
  try {
    const isPremiumRemoval =
      process.env.UNLOCK_ALL_FEATURES === "true" || req.user.subscriptionTier === "premium";
    if (!isPremiumRemoval) {
      return res.status(403).json({
        success: false,
        message: "Automated broker removal is a Premium feature. Upgrade to remove your data.",
      });
    }

    const broker = await prisma.dataBroker.findUnique({ where: { id: req.params.brokerId } });
    if (!broker) {
      return res.status(404).json({ success: false, message: "Broker not found" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Upsert the removal record
    const removal = await prisma.brokerRemoval.upsert({
      where: {
        userId_brokerId: { userId: req.user.id, brokerId: broker.id },
      },
      update: {
        status: "requested",
        requestedAt: new Date(),
        nextFollowUp: new Date(Date.now() + broker.estimatedDays * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: req.user.id,
        brokerId: broker.id,
        status: "requested",
        requestedAt: new Date(),
        nextFollowUp: new Date(Date.now() + broker.estimatedDays * 24 * 60 * 60 * 1000),
      },
    });

    // For email-based brokers with templates, auto-send the opt-out email
    if (broker.removalMethod === "email" && broker.optOutEmail && broker.optOutTemplate) {
      try {
        const emailBody = broker.optOutTemplate
          .replace(/{name}/g, `${user.firstName || ""} ${user.lastName || ""}`.trim())
          .replace(/{email}/g, user.email);

        await sendBrokerRemovalEmail(broker.optOutEmail, emailBody, user.email);

        await prisma.brokerRemoval.update({
          where: { id: removal.id },
          data: { status: "submitted", submittedAt: new Date() },
        });

        logger.info("broker_removal_email_sent", {
          brokerId: broker.id,
          userId: req.user.id,
          broker: broker.name,
        });

        return res.json({
          success: true,
          message: `Opt-out email sent to ${broker.name}. Expected removal in ${broker.estimatedDays} days.`,
          data: { status: "submitted" },
        });
      } catch (emailErr) {
        logger.warn("broker_removal_email_failed", {
          error: emailErr.message,
          broker: broker.name,
        });
        // Still mark as requested even if email fails
      }
    }

    return res.json({
      success: true,
      message:
        broker.removalMethod === "form"
          ? `Visit ${broker.name}'s opt-out page to submit your removal request. We'll track the status.`
          : `Removal request initiated for ${broker.name}.`,
      data: {
        status: removal.status,
        removalUrl: broker.removalUrl,
        removalMethod: broker.removalMethod,
      },
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/broker-removals/:brokerId/confirm — mark a removal as confirmed (user verifies)
router.post("/:brokerId/confirm", async (req, res, next) => {
  try {
    const removal = await prisma.brokerRemoval.findUnique({
      where: {
        userId_brokerId: { userId: req.user.id, brokerId: req.params.brokerId },
      },
    });

    if (!removal) {
      return res.status(404).json({ success: false, message: "No removal request found" });
    }

    await prisma.brokerRemoval.update({
      where: { id: removal.id },
      data: { status: "confirmed", confirmedAt: new Date() },
    });

    return res.json({ success: true, message: "Removal confirmed" });
  } catch (e) {
    next(e);
  }
});

// POST /api/broker-removals/request-all — request removal from all brokers at once (premium)
router.post("/request-all", async (req, res, next) => {
  try {
    const isPremiumBulk =
      process.env.UNLOCK_ALL_FEATURES === "true" || req.user.subscriptionTier === "premium";
    if (!isPremiumBulk) {
      return res.status(403).json({ success: false, message: "Premium feature" });
    }

    const brokers = await prisma.dataBroker.findMany();
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    let submitted = 0;
    let requested = 0;

    for (const broker of brokers) {
      const existing = await prisma.brokerRemoval.findUnique({
        where: {
          userId_brokerId: { userId: req.user.id, brokerId: broker.id },
        },
      });

      if (existing && (existing.status === "confirmed" || existing.status === "submitted")) {
        continue;
      }

      const removal = await prisma.brokerRemoval.upsert({
        where: {
          userId_brokerId: { userId: req.user.id, brokerId: broker.id },
        },
        update: {
          status: "requested",
          requestedAt: new Date(),
          nextFollowUp: new Date(Date.now() + broker.estimatedDays * 24 * 60 * 60 * 1000),
        },
        create: {
          userId: req.user.id,
          brokerId: broker.id,
          status: "requested",
          requestedAt: new Date(),
          nextFollowUp: new Date(Date.now() + broker.estimatedDays * 24 * 60 * 60 * 1000),
        },
      });

      // Auto-send email for email-based brokers
      if (broker.removalMethod === "email" && broker.optOutEmail && broker.optOutTemplate) {
        try {
          const emailBody = broker.optOutTemplate
            .replace(/{name}/g, `${user.firstName || ""} ${user.lastName || ""}`.trim())
            .replace(/{email}/g, user.email);

          await sendBrokerRemovalEmail(broker.optOutEmail, emailBody, user.email);

          await prisma.brokerRemoval.update({
            where: { id: removal.id },
            data: { status: "submitted", submittedAt: new Date() },
          });
          submitted++;
        } catch {
          requested++;
        }
      } else {
        requested++;
      }
    }

    return res.json({
      success: true,
      message: `Removal initiated for all brokers. ${submitted} emails sent automatically, ${requested} require manual opt-out.`,
      data: { submitted, requested },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

