-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "clientShareUrl" TEXT,
ADD COLUMN     "gpsAutoEngineStopOnAlarm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gpsEngineCommandsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gpsLastAlertAt" TIMESTAMP(3),
ADD COLUMN     "gpsLastEventId" INTEGER,
ADD COLUMN     "gpsMonitoringEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gpsWhatsappAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monitoringPhones" TEXT;
