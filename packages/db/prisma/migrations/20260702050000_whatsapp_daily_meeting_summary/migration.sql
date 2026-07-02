CREATE TABLE "WhatsAppDailySummarySettings" (
  "id" TEXT NOT NULL DEFAULT 'meeting-summary',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "recipientName" TEXT,
  "recipientPhone" TEXT NOT NULL DEFAULT '097684200',
  "sendTime" TEXT NOT NULL DEFAULT '18:00',
  "messageTemplate" TEXT NOT NULL DEFAULT 'Resumen de reuniones para {fecha}

{reuniones}

Security Solutions',
  "lastSentForDate" TEXT,
  "lastSentAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsAppDailySummarySettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "WhatsAppDailySummarySettings" ("id", "enabled", "recipientName", "recipientPhone", "sendTime")
VALUES ('meeting-summary', true, 'Lewis', '097684200', '18:00')
ON CONFLICT ("id") DO NOTHING;
