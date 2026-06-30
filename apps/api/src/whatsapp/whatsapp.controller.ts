import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";
import { WhatsAppService } from "./whatsapp.service";

@Controller("whatsapp")
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get("status")
  status() {
    return this.whatsAppService.status();
  }

  @Get("sync")
  sync() {
    return this.whatsAppService.sync();
  }

  @Post("send")
  send(@Body() dto: SendWhatsAppMessageDto) {
    return this.whatsAppService.send(dto);
  }
}
