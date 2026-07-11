-- AlterTable
ALTER TABLE "VehicleAlertLog" ADD COLUMN     "geofenceName" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "mapUrl" TEXT;
