const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { prisma } = require("../utils/db");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { referralCode: true, referralCount: true, referralCredits: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.user.id },
      select: {
        id: true,
        status: true,
        creditAwarded: true,
        createdAt: true,
        referee: { select: { firstName: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

    return res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `${frontend}/signup?ref=${user.referralCode}`,
        referralCount: user.referralCount,
        referralCredits: user.referralCredits,
        referrals,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
