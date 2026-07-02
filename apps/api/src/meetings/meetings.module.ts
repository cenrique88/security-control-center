import { Module } from "@nestjs/common";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { MeetingsController } from "./meetings.controller";
import { MeetingsService } from "./meetings.service";

@Module({
  imports: [WhatsAppModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
