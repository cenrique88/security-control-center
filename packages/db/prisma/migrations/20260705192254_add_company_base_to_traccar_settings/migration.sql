-- AlterTable
ALTER TABLE "TraccarSettings" ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyLatitude" DECIMAL(10,7),
ADD COLUMN     "companyLongitude" DECIMAL(10,7),
ADD COLUMN     "companyName" TEXT NOT NULL DEFAULT 'Security Solutions';
