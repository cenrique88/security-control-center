-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('NORMAL', 'THIRD_PARTY');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "type" "CustomerType" NOT NULL DEFAULT 'NORMAL';

-- CreateIndex
CREATE INDEX "Customer_type_idx" ON "Customer"("type");
