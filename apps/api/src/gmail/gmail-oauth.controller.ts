import { Controller, Get, Query } from "@nestjs/common";
import { GmailService } from "./gmail.service";

@Controller("gmail/oauth")
export class GmailOAuthController {
  constructor(private readonly gmailService: GmailService) {}

  @Get("url")
  authorizationUrl() {
    return this.gmailService.getAuthorizationUrl();
  }

  @Get("callback")
  async callback(@Query("code") code?: string, @Query("error") error?: string) {
    if (error) {
      return {
        ok: false,
        error,
      };
    }

    if (!code) {
      return {
        ok: false,
        error: "Google did not return an authorization code",
      };
    }

    const result = await this.gmailService.completeOAuth(code);

    return {
      ok: true,
      message: "Copy this value into GMAIL_REFRESH_TOKEN in the .env file, then restart the API.",
      env: `GMAIL_REFRESH_TOKEN="${result.refreshToken}"`,
    };
  }
}
