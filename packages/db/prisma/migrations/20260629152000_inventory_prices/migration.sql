ALTER TABLE "InventoryItem"
ADD COLUMN "supplierCategory" TEXT,
ADD COLUMN "costPrice" DECIMAL(12, 2),
ADD COLUMN "taxAmount" DECIMAL(12, 2),
ADD COLUMN "priceWithTax" DECIMAL(12, 2),
ADD COLUMN "currency" TEXT DEFAULT 'USD';

CREATE INDEX "InventoryItem_supplier_idx" ON "InventoryItem"("supplier");
CREATE INDEX "InventoryItem_supplierCategory_idx" ON "InventoryItem"("supplierCategory");
