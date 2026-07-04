-- DropIndex
DROP INDEX "Meeting_reminder_lookup_idx";

-- AlterTable
ALTER TABLE "LaborPointRate" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PriceBookItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "QuoteItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WhatsAppDailySummarySettings" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "reportAfterNotes" TEXT,
ADD COLUMN     "reportBeforeNotes" TEXT,
ADD COLUMN     "reportPhotos" JSONB,
ADD COLUMN     "reportRecommendations" TEXT,
ADD COLUMN     "reportTasks" TEXT,
ADD COLUMN     "reportTests" TEXT;
