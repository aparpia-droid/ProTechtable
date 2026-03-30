require("dotenv").config();
const { logger } = require("./utils/logger");

const REQUIRED_VARS = ["DATABASE_URL", "JWT_SECRET", "ENCRYPTION_KEY"];

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  logger.error("missing_env_vars", { vars: missing });
  process.stderr.write(`FATAL: Missing required environment variables: ${missing.join(", ")}\n`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  process.stderr.write("FATAL: JWT_SECRET must be at least 32 characters\n");
  process.exit(1);
}

if (process.env.ENCRYPTION_KEY.length < 32) {
  process.stderr.write("FATAL: ENCRYPTION_KEY must be at least 32 characters\n");
  process.exit(1);
}

const app = require("./app");
const { prisma } = require("./utils/db");
const { runEmailJobs } = require("./jobs/emailScheduler");

const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => {
  logger.info("server_started", { port, env: process.env.NODE_ENV || "development" });
});

if (process.env.REDIS_URL) {
  try {
    const { startAssessmentWorker } = require("./jobs/assessmentWorker");
    startAssessmentWorker();
  } catch (e) {
    logger.warn("assessment_worker_start_failed", { message: e.message });
  }
}

setInterval(() => {
  runEmailJobs().catch((err) => {
    logger.error("email_scheduler_error", { error: err.message });
  });
}, 60 * 60 * 1000);

setTimeout(() => {
  runEmailJobs().catch((err) => {
    logger.error("email_scheduler_startup_error", { error: err.message });
  });
}, 30000);

function shutdown(signal) {
  logger.info("shutdown_signal", { signal });
  server.close(async () => {
    try {
      if (process.env.REDIS_URL) {
        const { closeAssessmentQueue } = require("./jobs/assessmentWorker");
        await closeAssessmentQueue();
      }
    } catch (e) {
      logger.warn("queue_close_failed", { message: e.message });
    }
    await prisma.$disconnect();
    logger.info("shutdown_complete");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("forced_shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
