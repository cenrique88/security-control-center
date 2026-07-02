-- CreateTable
CREATE TABLE "CustomerLaborPointRate" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pointValue" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 22,
    "currency" TEXT NOT NULL DEFAULT 'UYU',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerLaborPointRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPriceOverride" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "priceBookItemId" TEXT NOT NULL,
    "salePrice" DECIMAL(12,2) NOT NULL,
    "costPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 22,
    "currency" TEXT NOT NULL DEFAULT 'UYU',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerLaborPointRate_customerId_idx" ON "CustomerLaborPointRate"("customerId");

-- CreateIndex
CREATE INDEX "CustomerLaborPointRate_active_idx" ON "CustomerLaborPointRate"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPriceOverride_customerId_priceBookItemId_key" ON "CustomerPriceOverride"("customerId", "priceBookItemId");

-- CreateIndex
CREATE INDEX "CustomerPriceOverride_customerId_idx" ON "CustomerPriceOverride"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPriceOverride_priceBookItemId_idx" ON "CustomerPriceOverride"("priceBookItemId");

-- CreateIndex
CREATE INDEX "CustomerPriceOverride_active_idx" ON "CustomerPriceOverride"("active");

-- AddForeignKey
ALTER TABLE "CustomerLaborPointRate" ADD CONSTRAINT "CustomerLaborPointRate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPriceOverride" ADD CONSTRAINT "CustomerPriceOverride_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPriceOverride" ADD CONSTRAINT "CustomerPriceOverride_priceBookItemId_fkey" FOREIGN KEY ("priceBookItemId") REFERENCES "PriceBookItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
