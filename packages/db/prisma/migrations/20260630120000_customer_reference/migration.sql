ALTER TABLE "Customer" ADD COLUMN "reference" TEXT;

WITH numbered_customers AS (
  SELECT "id", row_number() OVER (ORDER BY "createdAt", "id") AS number
  FROM "Customer"
)
UPDATE "Customer"
SET "reference" = 'CLI-' || lpad(numbered_customers.number::text, 4, '0')
FROM numbered_customers
WHERE "Customer"."id" = numbered_customers."id";

ALTER TABLE "Customer" ALTER COLUMN "reference" SET NOT NULL;

CREATE UNIQUE INDEX "Customer_reference_key" ON "Customer"("reference");
