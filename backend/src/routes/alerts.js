const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { prisma } = require("../utils/db");

const router = express.Router();

router.use(authMiddleware);

// GET /api/alerts
router.get("/", async (req, res, next) => {
  try {
    const alerts = await prisma.monitoringAlert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = alerts.filter((a) => !a.read).length;
    return res.json({ success: true, data: alerts, unreadCount });
  } catch (e) {
    next(e);
  }
});

// POST /api/alerts/read-all — must be before /:id/read
router.post("/read-all", async (req, res, next) => {
  try {
    await prisma.monitoringAlert.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/alerts/:id/read
router.post("/:id/read", async (req, res, next) => {
  try {
    await prisma.monitoringAlert.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
