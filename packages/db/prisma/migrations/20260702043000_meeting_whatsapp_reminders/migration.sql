ALTER TABLE "Meeting"
  ADD COLUMN "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "reminderMinutesBefore" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "reminderSentAt" TIMESTAMP(3);

CREATE INDEX "Meeting_reminder_lookup_idx" ON "Meeting"("status", "reminderEnabled", "reminderSentAt", "dateTime");
