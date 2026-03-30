-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationTokenExpiry" TIMESTAMP(3);

UPDATE "User" SET "passwordChangedAt" = COALESCE("updatedAt", "createdAt") WHERE "passwordChangedAt" IS NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "User_verificationToken_idx" ON "User"("verificationToken");
CREATE INDEX IF NOT EXISTS "User_resetToken_idx" ON "User"("resetToken");
CREATE INDEX IF NOT EXISTS "Assessment_userId_idx" ON "Assessment"("userId");
CREATE INDEX IF NOT EXISTS "RemediationAction_userId_idx" ON "RemediationAction"("userId");
CREATE INDEX IF NOT EXISTS "RemediationAction_assessmentId_idx" ON "RemediationAction"("assessmentId");
