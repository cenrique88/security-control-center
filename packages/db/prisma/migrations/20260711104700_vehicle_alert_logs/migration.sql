-- CreateTable
CREATE TABLE "VehicleAlertLog" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "eventId" INTEGER,
    "eventType" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "error" TEXT,
    "traccarDeviceId" TEXT,
    "geofenceId" INTEGER,
    "positionId" INTEGER,
    "eventTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleAlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleAlertLog_vehicleId_createdAt_idx" ON "VehicleAlertLog"("vehicleId", "createdAt");

-- CreateIndex
CREATE INDEX "VehicleAlertLog_eventId_idx" ON "VehicleAlertLog"("eventId");

-- CreateIndex
CREATE INDEX "VehicleAlertLog_eventType_idx" ON "VehicleAlertLog"("eventType");

-- AddForeignKey
ALTER TABLE "VehicleAlertLog" ADD CONSTRAINT "VehicleAlertLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
