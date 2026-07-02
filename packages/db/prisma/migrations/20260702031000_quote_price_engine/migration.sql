-- Extend services supported by Security Solutions.
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'CABLING';
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'ELECTRIC_FENCE';
ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'AUTOMATION';

CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE "QuoteItemType" AS ENUM ('EQUIPMENT', 'MATERIAL', 'SUPPLY', 'LABOR', 'EXPENSE');

CREATE TABLE "PriceBookItem" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "QuoteItemType" NOT NULL DEFAULT 'EQUIPMENT',
  "category" TEXT NOT NULL,
  "service" "ServiceType",
  "brand" TEXT,
  "model" TEXT,
  "description" TEXT,
  "unit" TEXT NOT NULL DEFAULT 'u',
  "costPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "salePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 22,
  "currency" TEXT NOT NULL DEFAULT 'UYU',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PriceBookItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PriceBookItem_code_key" ON "PriceBookItem"("code");
CREATE INDEX "PriceBookItem_category_idx" ON "PriceBookItem"("category");
CREATE INDEX "PriceBookItem_service_idx" ON "PriceBookItem"("service");
CREATE INDEX "PriceBookItem_active_idx" ON "PriceBookItem"("active");

CREATE TABLE "LaborPointRate" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "pointValue" DECIMAL(12,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 22,
  "currency" TEXT NOT NULL DEFAULT 'UYU',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LaborPointRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LaborPointRate_code_key" ON "LaborPointRate"("code");

ALTER TABLE "Quote"
  ADD COLUMN "meetingId" TEXT,
  ADD COLUMN "service" "ServiceType" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'UYU',
  ADD COLUMN "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "validUntil" TIMESTAMP(3),
  ADD COLUMN "taxIncluded" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN "profitMarginPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN "materialsSubtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "laborSubtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "expensesSubtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "taxableBase" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "costTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "estimatedProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "estimatedMargin" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN "internalNotes" TEXT,
  ADD COLUMN "commercialTerms" TEXT,
  ADD COLUMN "executionTime" TEXT,
  ADD COLUMN "warranty" TEXT,
  ADD COLUMN "paymentTerms" TEXT,
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "createdBy" TEXT;

ALTER TABLE "Quote" ALTER COLUMN "laborPoints" TYPE DECIMAL(8,2) USING "laborPoints"::DECIMAL(8,2);
UPDATE "Quote" SET "taxableBase" = "subtotal", "status" = CASE WHEN "acceptedAt" IS NULL THEN 'DRAFT'::"QuoteStatus" ELSE 'APPROVED'::"QuoteStatus" END;

CREATE INDEX "Quote_customerId_idx" ON "Quote"("customerId");
CREATE INDEX "Quote_meetingId_idx" ON "Quote"("meetingId");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
CREATE INDEX "Quote_service_idx" ON "Quote"("service");

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "QuoteItem" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "priceBookItemId" TEXT,
  "type" "QuoteItemType" NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(12,2) NOT NULL,
  "unit" TEXT NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 22,
  "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "taxAmount" DECIMAL(12,2) NOT NULL,
  "total" DECIMAL(12,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");
CREATE INDEX "QuoteItem_priceBookItemId_idx" ON "QuoteItem"("priceBookItemId");
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_priceBookItemId_fkey" FOREIGN KEY ("priceBookItemId") REFERENCES "PriceBookItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "QuoteHistory" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "comment" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuoteHistory_quoteId_idx" ON "QuoteHistory"("quoteId");
ALTER TABLE "QuoteHistory" ADD CONSTRAINT "QuoteHistory_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "LaborPointRate" ("id", "code", "name", "pointValue", "taxRate", "currency", "notes")
VALUES ('labor-point-default', 'PUNTA_BASE', 'Mano de obra por punta', 770.00, 22.00, 'UYU', 'Valor inicial: 1 punta = $770 sin IVA / $939,40 IVA incluido.')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "PriceBookItem" ("id", "code", "name", "type", "category", "service", "description", "unit", "costPrice", "salePrice", "taxRate", "currency")
VALUES
  ('price-cctv-camera-basic', 'CCTV-CAM-001', 'Camara CCTV ejemplo', 'EQUIPMENT', 'Camaras', 'CCTV', 'Camara de seguridad para presupuesto base.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-cctv-nvr-basic', 'CCTV-NVR-001', 'DVR / NVR ejemplo', 'EQUIPMENT', 'DVR / NVR', 'CCTV', 'Grabador para sistema CCTV.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-cctv-hdd-basic', 'CCTV-HDD-001', 'Disco duro ejemplo', 'EQUIPMENT', 'Discos duros', 'CCTV', 'Disco para almacenamiento de video.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-network-cable-utp', 'RED-CABLE-001', 'Cable UTP', 'MATERIAL', 'Cable UTP', 'NETWORKING', 'Cable de red por metro.', 'metro', 0, 0, 22, 'UYU'),
  ('price-network-switch', 'RED-SW-001', 'Switch ejemplo', 'EQUIPMENT', 'Switches', 'NETWORKING', 'Switch para red o CCTV.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-cctv-box', 'CCTV-CAJA-001', 'Caja estanco', 'MATERIAL', 'Cajas estanco', 'CCTV', 'Caja estanco para instalacion exterior.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-alarm-central', 'ALR-CEN-001', 'Central de alarma ejemplo', 'EQUIPMENT', 'Alarmas', 'ALARM', 'Central de alarma base.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-alarm-pir', 'ALR-PIR-001', 'Sensor PIR ejemplo', 'EQUIPMENT', 'PIR', 'ALARM', 'Sensor de movimiento.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-alarm-magnetic', 'ALR-MAG-001', 'Magnetico ejemplo', 'EQUIPMENT', 'Magneticos', 'ALARM', 'Contacto magnetico para aberturas.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-access-reader', 'ACC-LECT-001', 'Lectora ejemplo', 'EQUIPMENT', 'Lectoras', 'ACCESS_CONTROL', 'Lectora para control de acceso.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-access-lock', 'ACC-CERR-001', 'Cerradura ejemplo', 'EQUIPMENT', 'Cerraduras', 'ACCESS_CONTROL', 'Cerradura electrica o electromagnetica.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-gps-device', 'GPS-EQ-001', 'Equipo GPS ejemplo', 'EQUIPMENT', 'GPS', 'GPS', 'Equipo GPS para vehiculo.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-supplies-general', 'INS-GRAL-001', 'Insumos generales', 'SUPPLY', 'Insumos', 'OTHER', 'Conectores, tornilleria, precintos y consumibles.', 'unidad', 0, 0, 22, 'UYU'),
  ('price-labor-point', 'MO-PUNTA-001', 'Mano de obra por punta', 'LABOR', 'Mano de obra', 'OTHER', 'Linea calculada por cantidad de puntas.', 'punta', 770, 770, 22, 'UYU'),
  ('price-expense-visit', 'GST-VIS-001', 'Gasto / visita tecnica', 'EXPENSE', 'Gastos', 'OTHER', 'Gastos operativos, traslado o visita tecnica.', 'unidad', 0, 0, 22, 'UYU')
ON CONFLICT ("code") DO NOTHING;
