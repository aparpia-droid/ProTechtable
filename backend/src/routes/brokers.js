const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { prisma } = require("../utils/db");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const brokers = await prisma.dataBroker.findMany({ orderBy: { name: "asc" } });
    const isPremium =
      process.env.UNLOCK_ALL_FEATURES === "true" || req.user.subscriptionTier === "premium";

    const data = brokers.map((b, index) => ({
      id: b.id,
      name: b.name,
      removalMethod: b.removalMethod,
      difficulty: b.difficulty,
      removalUrl: isPremium || index < 3 ? b.removalUrl : null,
      locked: !isPremium && index >= 3,
      detectable: b.detectable,
    }));

    return res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
