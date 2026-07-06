-- AlterTable
ALTER TABLE "DispatchStop" ADD COLUMN "vehicleKey" TEXT NOT NULL DEFAULT 'unassigned';

-- Backfill
UPDATE "DispatchStop" SET "vehicleKey" = COALESCE("vehicleId", 'unassigned');

-- Replace nullable unique key with a stable non-null key.
DROP INDEX IF EXISTS "DispatchStop_date_vehicleId_stopKey_key";
CREATE UNIQUE INDEX "DispatchStop_date_vehicleKey_stopKey_key" ON "DispatchStop"("date", "vehicleKey", "stopKey");
