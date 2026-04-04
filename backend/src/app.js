const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const assessmentsRoutes = require("./routes/assessments");
const { planRouter, actionsRouter } = require("./routes/remediation");
const brokersRoutes = require("./routes/brokers");
const paymentRoutes = require("./routes/payment");
const paymentWebhook = require("./routes/paymentWebhook");
const userRoutes = require("./routes/user");
const userEmailsRoutes = require("./routes/userEmails");
const brokerRemovalsRoutes = require("./routes/brokerRemovals");
const alertsRoutes = require("./routes/alerts");
const publicScanRoutes = require("./routes/publicScan");
const referralRoutes = require("./routes/referrals");
const campusReportRoutes = require("./routes/campusReport");
const brokerDetectionRoutes = require("./routes/brokerDetection");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");
const { csrfOriginCheck } = require("./middleware/csrfOrigin");

const app = express();

// IMPORTANT: This assumes exactly ONE reverse proxy in front of Express
// (e.g., Heroku, Railway, Render, single Nginx/ALB).
// If behind multiple proxies (CDN + ALB), change to the number of hops.
// If exposed directly to the internet (no proxy), set to false.
// Incorrect values break rate limiting — attackers can spoof X-Forwarded-For.
app.set("trust proxy", 1);

app.use("/api/payment/webhook", paymentWebhook);

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);

const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: frontend,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(requestLogger);
app.use(csrfOriginCheck);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const api = express.Router();
api.use(generalLimiter);

api.use("/scan", publicScanRoutes);
api.use("/auth", authRoutes);
api.use("/assessments", assessmentsRoutes);
api.use("/remediation", planRouter);
api.use("/remediation-actions", actionsRouter);
api.use("/brokers", brokersRoutes);
api.use("/payment", paymentRoutes);
api.use("/broker-removals", brokerRemovalsRoutes);
api.use("/alerts", alertsRoutes);
api.use("/referrals", referralRoutes);
api.use("/campus", campusReportRoutes);
api.use("/broker-detection", brokerDetectionRoutes);
api.use("/user", userRoutes);
api.use("/user", userEmailsRoutes);

app.use("/api", api);

app.use(errorHandler);

module.exports = app;
