const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");
const { prisma } = require("../utils/db");
const { runAssessmentPipeline } = require("../services/assessmentRun");
const { sendAssessmentSummaryEmail } = require("../services/email");
const { encrypt } = require("../services/encryption");
const { logger } = require("../utils/logger");

let connection;
/** @type {import('bullmq').Queue | null} */
let assessmentQueue;
/** @type {import('bullmq').Worker | null} */
let worker;

function getConnection() {
  if (!process.env.REDIS_URL) return null;
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  }
  return connection;
}

/**
 * @param {{ assessmentId: string, userId: string, email: string, userEmail: string }} payload
 */
async function enqueueAssessment(payload) {
  const conn = getConnection();
  if (!conn) throw new Error("REDIS_URL not configured");
  if (!assessmentQueue) {
    assessmentQueue = new Queue("assessments", { connection: conn });
  }
  await assessmentQueue.add("run", payload, {
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

function startAssessmentWorker() {
  const conn = getConnection();
  if (!conn || worker) return;

  worker = new Worker(
    "assessments",
    async (job) => {
      const { assessmentId, userId, email, userEmail } = job.data;
      const hibpKey = process.env.HIBP_API_KEY || "";
      const shodanKey = process.env.SHODAN_API_KEY || "";
      const hunterKey = process.env.HUNTER_IO_API_KEY || "";
      const keys = { hibpKey, shodanKey, hunterKey };

      try {
        const pipeline = await runAssessmentPipeline(email, keys);
        const encryptedStored = encrypt(email) || email;

        await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            status: "completed",
            emailSearched: encryptedStored,
            score: pipeline.scoreResult.totalScore,
            riskLevel: pipeline.scoreResult.riskLevel,
            breachesFound: pipeline.breachesFound,
            dataBrokersFound: pipeline.dataBrokersFound,
            publicProfiles: pipeline.publicProfiles,
            assessmentData: pipeline.assessmentData,
          },
        });

        try {
          await sendAssessmentSummaryEmail(userEmail, {
            score: pipeline.scoreResult.totalScore,
            riskLevel: pipeline.scoreResult.riskLevel,
            breachesFound: pipeline.breachesFound,
            dataBrokersFound: pipeline.dataBrokersFound,
            assessmentId,
          });
        } catch {
          /* non-fatal */
        }
      } catch (err) {
        logger.error("assessment_job_failed", { assessmentId, message: err.message });
        await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            status: "failed",
            riskLevel: "unknown",
            assessmentData: { error: err.message },
          },
        });
        throw err;
      }
    },
    { connection: conn, concurrency: 3 }
  );

  worker.on("failed", (job, err) => {
    logger.warn("assessment_worker_job_failed", { id: job?.id, message: err.message });
  });
}

async function closeAssessmentQueue() {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (assessmentQueue) {
    await assessmentQueue.close();
    assessmentQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}

module.exports = {
  enqueueAssessment,
  startAssessmentWorker,
  closeAssessmentQueue,
};
