ALTER TABLE "InventoryItem" ADD COLUMN "reference" TEXT;

WITH ordered_items AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS row_number
  FROM "InventoryItem"
)
UPDATE "InventoryItem"
SET "reference" = 'ART-' || LPAD(ordered_items.row_number::text, 4, '0')
FROM ordered_items
WHERE "InventoryItem"."id" = ordered_items."id";

ALTER TABLE "InventoryItem" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "InventoryItem_reference_key" ON "InventoryItem"("reference");
