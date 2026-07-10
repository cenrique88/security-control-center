UPDATE "QuoteItem" AS qi
SET "description" = ii."name"
FROM "InventoryItem" AS ii
WHERE qi."inventoryItemId" = ii."id"
  AND ii."name" IS NOT NULL
  AND qi."description" IS DISTINCT FROM ii."name";
