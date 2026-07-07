ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "quoteId" TEXT,
  ADD COLUMN IF NOT EXISTS "workOrderId" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicleId" TEXT,
  ADD COLUMN IF NOT EXISTS "transactionType" TEXT NOT NULL DEFAULT 'INCOME',
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'CLIENT_PAYMENT',
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'UYU',
  ADD COLUMN IF NOT EXISTS "method" TEXT,
  ADD COLUMN IF NOT EXISTS "reference" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

CREATE INDEX IF NOT EXISTS "Payment_transactionType_idx" ON "Payment"("transactionType");
CREATE INDEX IF NOT EXISTS "Payment_category_idx" ON "Payment"("category");
CREATE INDEX IF NOT EXISTS "Payment_quoteId_idx" ON "Payment"("quoteId");
CREATE INDEX IF NOT EXISTS "Payment_workOrderId_idx" ON "Payment"("workOrderId");
CREATE INDEX IF NOT EXISTS "Payment_vehicleId_idx" ON "Payment"("vehicleId");

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
