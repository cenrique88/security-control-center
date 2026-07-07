-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'MATERIAL';
ALTER TABLE "InventoryItem" ADD COLUMN "customerId" TEXT;

-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN "sourceType" TEXT;
ALTER TABLE "InventoryMovement" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE INDEX "InventoryItem_sourceType_idx" ON "InventoryItem"("sourceType");
CREATE INDEX "InventoryItem_customerId_idx" ON "InventoryItem"("customerId");
CREATE INDEX "InventoryItem_supplier_idx" ON "InventoryItem"("supplier");
CREATE INDEX "InventoryMovement_sourceType_idx" ON "InventoryMovement"("sourceType");
CREATE INDEX "InventoryMovement_customerId_idx" ON "InventoryMovement"("customerId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
