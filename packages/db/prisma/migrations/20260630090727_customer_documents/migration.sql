-- DropIndex
DROP INDEX "InventoryItem_managedStock_idx";

-- DropIndex
DROP INDEX "InventoryItem_name_idx";

-- DropIndex
DROP INDEX "InventoryItem_supplierCategory_idx";

-- DropIndex
DROP INDEX "InventoryItem_supplier_idx";

-- DropIndex
DROP INDEX "InventoryMovement_itemId_createdAt_idx";

-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "dataUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerDocument_customerId_idx" ON "CustomerDocument"("customerId");

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
