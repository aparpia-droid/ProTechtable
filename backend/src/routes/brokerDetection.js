const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { prisma } = require("../utils/db");
const { detectAllBrokers } = require("../services/brokerDetector");

const router = express.Router();
router.use(authMiddleware);

function parseDataFound(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

router.post("/scan", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.subscriptionTier !== "premium") {
      return res.status(403).json({
        success: false,
        message: "Broker detection requires Premium. Upgrade to scan broker sites.",
      });
    }

    const firstName = req.body.firstName || user.firstName;
    const lastName = req.body.lastName || user.lastName;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First and last name required for broker detection.",
      });
    }

    const state = req.body.state || "";

    const brokers = await prisma.dataBroker.findMany({
      where: { detectable: true },
    });

    if (brokers.length === 0) {
      return res.json({
        success: true,
        data: {
          scanned: 0,
          detected: 0,
          results: [],
          message: "No detectable brokers configured.",
        },
      });
    }

    const results = await detectAllBrokers({ firstName, lastName, state }, brokers);

    for (const r of results) {
      if (r.unsupported) continue;

      await prisma.brokerDetection.create({
        data: {
          userId: user.id,
          brokerId: r.brokerId,
          detected: r.detected,
          profileUrl: r.profileUrl || null,
          dataFound: r.dataFound ? JSON.stringify(r.dataFound) : null,
        },
      });
    }

    const detectedCount = results.filter((r) => r.detected).length;
    const confirmedRemovals = await prisma.brokerRemoval.count({
      where: { userId: user.id, status: "confirmed" },
    });

    const totalDetectable = brokers.length;
    const exposureScore =
      totalDetectable > 0 ? Math.round((detectedCount / totalDetectable) * 100) : 0;

    await prisma.footprintSnapshot.create({
      data: {
        userId: user.id,
        totalBrokers: totalDetectable,
        detectedCount,
        removedCount: confirmedRemovals,
        exposureScore,
      },
    });

    return res.json({
      success: true,
      data: {
        scanned: brokers.length,
        detected: detectedCount,
        exposureScore,
        results: results.map((r) => ({
          brokerName: r.brokerName,
          detected: r.detected,
          profileUrl: r.profileUrl || null,
          dataFound: r.dataFound || [],
          error: r.error || null,
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/results", async (req, res, next) => {
  try {
    const detections = await prisma.brokerDetection.findMany({
      where: { userId: req.user.id },
      orderBy: { scannedAt: "desc" },
      include: {
        broker: { select: { name: true, category: true, removalUrl: true, removalMethod: true } },
      },
    });

    const latestMap = new Map();
    for (const d of detections) {
      if (!latestMap.has(d.brokerId)) {
        latestMap.set(d.brokerId, d);
      }
    }
    const latest = Array.from(latestMap.values());

    const detected = latest.filter((d) => d.detected);
    const clean = latest.filter((d) => !d.detected);

    return res.json({
      success: true,
      data: {
        totalScanned: latest.length,
        detectedCount: detected.length,
        cleanCount: clean.length,
        detected: detected.map((d) => ({
          brokerId: d.brokerId,
          brokerName: d.broker.name,
          category: d.broker.category,
          profileUrl: d.profileUrl,
          dataFound: parseDataFound(d.dataFound),
          removalUrl: d.broker.removalUrl,
          removalMethod: d.broker.removalMethod,
          scannedAt: d.scannedAt,
        })),
        clean: clean.map((d) => ({
          brokerId: d.brokerId,
          brokerName: d.broker.name,
          scannedAt: d.scannedAt,
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/footprint", async (req, res, next) => {
  try {
    const snapshots = await prisma.footprintSnapshot.findMany({
      where: { userId: req.user.id },
      orderBy: { snapshotAt: "asc" },
    });

    if (snapshots.length === 0) {
      return res.json({
        success: true,
        data: {
          snapshots: [],
          reduction: null,
        },
      });
    }

    const first = snapshots[0];
    const latest = snapshots[snapshots.length - 1];
    const reduction = {
      initialExposure: first.detectedCount,
      currentExposure: latest.detectedCount,
      removed: first.detectedCount - latest.detectedCount,
      reductionPercent:
        first.detectedCount > 0
          ? Math.round(((first.detectedCount - latest.detectedCount) / first.detectedCount) * 100)
          : 0,
      firstScanDate: first.snapshotAt,
      latestScanDate: latest.snapshotAt,
    };

    return res.json({
      success: true,
      data: {
        snapshots: snapshots.map((s) => ({
          totalBrokers: s.totalBrokers,
          detectedCount: s.detectedCount,
          removedCount: s.removedCount,
          exposureScore: s.exposureScore,
          date: s.snapshotAt,
        })),
        reduction,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
