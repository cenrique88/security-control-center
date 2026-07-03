-- CreateEnum
CREATE TYPE "QuotePricingMode" AS ENUM ('DIRECT', 'THIRD_PARTY', 'MANUAL');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "pricingMode" "QuotePricingMode" NOT NULL DEFAULT 'DIRECT';
