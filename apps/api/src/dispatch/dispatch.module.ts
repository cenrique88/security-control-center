import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { VehiclesModule } from "../vehicles/vehicles.module";
import { DispatchController } from "./dispatch.controller";
import { DispatchService } from "./dispatch.service";

@Module({
  imports: [PrismaModule, VehiclesModule],
  controllers: [DispatchController],
  providers: [DispatchService],
})
export class DispatchModule {}
