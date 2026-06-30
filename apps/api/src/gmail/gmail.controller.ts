import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SendGmailMessageDto } from "./dto/send-gmail-message.dto";
import { GmailService } from "./gmail.service";

@Controller("gmail")
@UseGuards(JwtAuthGuard)
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get("status")
  status() {
    return this.gmailService.status();
  }

  @Get("sync")
  sync() {
    return this.gmailService.sync();
  }

  @Post("send")
  send(@Body() dto: SendGmailMessageDto) {
    return this.gmailService.send(dto);
  }
}
