import { Module } from "@nestjs/common";
import { GmailModule } from "../gmail/gmail.module";
import { InventoryModule } from "../inventory/inventory.module";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [GmailModule, InventoryModule, WhatsAppModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
