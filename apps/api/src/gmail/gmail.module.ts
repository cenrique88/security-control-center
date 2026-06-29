import { Module } from "@nestjs/common";
import { GmailOAuthController } from "./gmail-oauth.controller";
import { GmailController } from "./gmail.controller";
import { GmailService } from "./gmail.service";

@Module({
  controllers: [GmailController, GmailOAuthController],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule {}
