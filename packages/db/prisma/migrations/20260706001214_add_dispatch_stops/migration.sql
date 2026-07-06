-- CreateEnum
CREATE TYPE "DispatchPlaceType" AS ENUM ('CLIENT', 'FUTURE_CLIENT', 'IMPORTER', 'WAREHOUSE', 'LUNCH', 'TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "DispatchStop" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vehicleId" TEXT,
    "stopKey" TEXT NOT NULL,
    "placeType" "DispatchPlaceType" NOT NULL DEFAULT 'CLIENT',
    "title" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "customerId" TEXT,
    "siteId" TEXT,
    "workOrderId" TEXT,
    "supplierName" TEXT,
    "futureClientName" TEXT,
    "kind" TEXT,
    "zone" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "parkingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tollCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'CRM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DispatchStop_date_idx" ON "DispatchStop"("date");

-- CreateIndex
CREATE INDEX "DispatchStop_vehicleId_idx" ON "DispatchStop"("vehicleId");

-- CreateIndex
CREATE INDEX "DispatchStop_customerId_idx" ON "DispatchStop"("customerId");

-- CreateIndex
CREATE INDEX "DispatchStop_workOrderId_idx" ON "DispatchStop"("workOrderId");

-- CreateIndex
CREATE INDEX "DispatchStop_supplierName_idx" ON "DispatchStop"("supplierName");

-- CreateIndex
CREATE UNIQUE INDEX "DispatchStop_date_vehicleId_stopKey_key" ON "DispatchStop"("date", "vehicleId", "stopKey");

-- AddForeignKey
ALTER TABLE "DispatchStop" ADD CONSTRAINT "DispatchStop_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
