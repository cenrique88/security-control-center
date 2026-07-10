-- Link approved quotes to generated work orders and stock movements.
ALTER TABLE "WorkOrder" ADD COLUMN "quoteId" TEXT;
ALTER TABLE "InventoryMovement" ADD COLUMN "quoteId" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "inventoryItemId" TEXT;

CREATE UNIQUE INDEX "WorkOrder_quoteId_key" ON "WorkOrder"("quoteId");
CREATE INDEX "InventoryMovement_quoteId_idx" ON "InventoryMovement"("quoteId");
CREATE INDEX "QuoteItem_inventoryItemId_idx" ON "QuoteItem"("inventoryItemId");

ALTER TABLE "WorkOrder"
  ADD CONSTRAINT "WorkOrder_quoteId_fkey"
  FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
  ADD CONSTRAINT "InventoryMovement_quoteId_fkey"
  FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuoteItem"
  ADD CONSTRAINT "QuoteItem_inventoryItemId_fkey"
  FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
