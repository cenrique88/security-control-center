-- Link financial movements with inventory stock movements.
ALTER TABLE "Payment"
ADD COLUMN "inventoryItemId" TEXT,
ADD COLUMN "quantity" INTEGER,
ADD COLUMN "unitPrice" DECIMAL(12,2);

ALTER TABLE "InventoryMovement"
ADD COLUMN "paymentId" TEXT,
ADD COLUMN "unitCost" DECIMAL(12,2),
ADD COLUMN "totalCost" DECIMAL(12,2),
ADD COLUMN "currency" TEXT DEFAULT 'UYU';

CREATE INDEX "Payment_inventoryItemId_idx" ON "Payment"("inventoryItemId");
CREATE INDEX "InventoryMovement_paymentId_idx" ON "InventoryMovement"("paymentId");

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_inventoryItemId_fkey"
FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "InventoryMovement"
ADD CONSTRAINT "InventoryMovement_paymentId_fkey"
FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
