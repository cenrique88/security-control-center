ALTER TABLE "InventoryItem"
ADD COLUMN "managedStock" BOOLEAN NOT NULL DEFAULT true;

UPDATE "InventoryItem"
SET "managedStock" = false
WHERE "supplier" IS NOT NULL
  AND "stock" = 0
  AND "minStock" = 0;

CREATE INDEX "InventoryItem_managedStock_idx" ON "InventoryItem"("managedStock");
