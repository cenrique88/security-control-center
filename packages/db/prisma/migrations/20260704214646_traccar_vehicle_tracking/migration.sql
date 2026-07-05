-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7);

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "fuelKmPerLiter" DECIMAL(8,2);

-- CreateTable
CREATE TABLE "TraccarSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "baseUrl" TEXT,
    "token" TEXT,
    "username" TEXT,
    "password" TEXT,
    "matchRadiusMeters" INTEGER NOT NULL DEFAULT 120,
    "minStopMinutes" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraccarSettings_pkey" PRIMARY KEY ("id")
);
