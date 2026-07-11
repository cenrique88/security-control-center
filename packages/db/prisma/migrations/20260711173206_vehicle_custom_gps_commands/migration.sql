-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "gpsCommandTextChannel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gpsEngineResumeCommand" TEXT,
ADD COLUMN     "gpsEngineStopCommand" TEXT,
ADD COLUMN     "gpsStatusCommand" TEXT;
