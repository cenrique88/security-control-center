import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FuelModule } from "../fuel/fuel.module";
import { GmailModule } from "../gmail/gmail.module";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { VehiclesController } from "./vehicles.controller";
import { VehiclesService } from "./vehicles.service";

@Module({
  imports: [ConfigModule, FuelModule, GmailModule, WhatsAppModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
