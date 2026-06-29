import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
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
}
