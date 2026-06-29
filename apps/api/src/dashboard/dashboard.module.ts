import { Module } from "@nestjs/common";
import { GmailModule } from "../gmail/gmail.module";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [GmailModule, WhatsAppModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
