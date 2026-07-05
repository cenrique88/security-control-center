-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "traccarGeofenceId" INTEGER;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "traccarGeofenceId" INTEGER;
