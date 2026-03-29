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
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");
const { csrfOriginCheck } = require("./middleware/csrfOrigin");

const app = express();

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
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use(csrfOriginCheck);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const api = express.Router();
api.use(generalLimiter);

api.use("/auth", authRoutes);
api.use("/assessments", assessmentsRoutes);
api.use("/remediation", planRouter);
api.use("/remediation-actions", actionsRouter);
api.use("/brokers", brokersRoutes);
api.use("/payment", paymentRoutes);
api.use("/user", userRoutes);

app.use("/api", api);

app.use(errorHandler);

module.exports = app;
