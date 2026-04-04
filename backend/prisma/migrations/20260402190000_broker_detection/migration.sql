-- AlterTable
ALTER TABLE "DataBroker" ADD COLUMN "searchUrl" TEXT,
ADD COLUMN "searchMethod" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN "detectable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "resultSelector" TEXT,
ADD COLUMN "noResultText" TEXT,
ADD COLUMN "optOutFormUrl" TEXT,
ADD COLUMN "automatable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BrokerDetection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "detected" BOOLEAN NOT NULL DEFAULT false,
    "profileUrl" TEXT,
    "dataFound" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerDetection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootprintSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalBrokers" INTEGER NOT NULL DEFAULT 0,
    "detectedCount" INTEGER NOT NULL DEFAULT 0,
    "removedCount" INTEGER NOT NULL DEFAULT 0,
    "exposureScore" INTEGER NOT NULL DEFAULT 0,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FootprintSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrokerDetection_userId_brokerId_scannedAt_key" ON "BrokerDetection"("userId", "brokerId", "scannedAt");

-- CreateIndex
CREATE INDEX "BrokerDetection_userId_idx" ON "BrokerDetection"("userId");

-- CreateIndex
CREATE INDEX "BrokerDetection_userId_brokerId_idx" ON "BrokerDetection"("userId", "brokerId");

-- CreateIndex
CREATE INDEX "FootprintSnapshot_userId_snapshotAt_idx" ON "FootprintSnapshot"("userId", "snapshotAt");

-- AddForeignKey
ALTER TABLE "BrokerDetection" ADD CONSTRAINT "BrokerDetection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerDetection" ADD CONSTRAINT "BrokerDetection_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "DataBroker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootprintSnapshot" ADD CONSTRAINT "FootprintSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
