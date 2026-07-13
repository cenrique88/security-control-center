ALTER TABLE "DispatchStop" ADD COLUMN "traccarGeofenceId" INTEGER;

CREATE INDEX "DispatchStop_traccarGeofenceId_idx" ON "DispatchStop"("traccarGeofenceId");
