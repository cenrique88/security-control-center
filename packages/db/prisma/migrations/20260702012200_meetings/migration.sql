CREATE TYPE "MeetingType" AS ENUM ('IN_PERSON', 'VIDEO_CALL', 'PHONE');

CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'DONE', 'CANCELLED');

CREATE TABLE "Meeting" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "dateTime" TIMESTAMP(3) NOT NULL,
  "contact" TEXT,
  "type" "MeetingType" NOT NULL,
  "status" "MeetingStatus" NOT NULL DEFAULT 'PENDING',
  "objective" TEXT NOT NULL,
  "notes" TEXT,
  "commitments" TEXT,
  "nextStep" TEXT,
  "followUpDate" TIMESTAMP(3),
  "attendees" TEXT,
  "needs" TEXT,
  "equipmentNeeded" TEXT,
  "estimatedBudget" DECIMAL(12,2),
  "closeProbability" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeetingAttachment" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "dataUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MeetingAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Meeting_customerId_idx" ON "Meeting"("customerId");
CREATE INDEX "Meeting_dateTime_idx" ON "Meeting"("dateTime");
CREATE INDEX "Meeting_followUpDate_idx" ON "Meeting"("followUpDate");
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");
CREATE INDEX "MeetingAttachment_meetingId_idx" ON "MeetingAttachment"("meetingId");

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingAttachment" ADD CONSTRAINT "MeetingAttachment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
