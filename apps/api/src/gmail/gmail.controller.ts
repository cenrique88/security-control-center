import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { SendGmailMessageDto } from "./dto/send-gmail-message.dto";
import { GmailService } from "./gmail.service";

@Controller("gmail")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.SALES, UserRole.MONITORING)
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
