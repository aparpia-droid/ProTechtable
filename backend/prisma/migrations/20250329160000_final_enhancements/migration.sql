-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'completed';
ALTER TABLE "Assessment" ADD COLUMN     "quickWinsEmailSentAt" TIMESTAMP(3);
ALTER TABLE "Assessment" ADD COLUMN     "progressNudgeSentAt" TIMESTAMP(3);
ALTER TABLE "Assessment" ADD COLUMN     "rescanReminderSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserEmail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifyCodeHash" TEXT,
    "verifyCodeExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmail_userId_email_key" ON "UserEmail"("userId", "email");

-- CreateIndex
CREATE INDEX "UserEmail_userId_idx" ON "UserEmail"("userId");

-- AddForeignKey
ALTER TABLE "UserEmail" ADD CONSTRAINT "UserEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
