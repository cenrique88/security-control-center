import { GmailService } from "./gmail.service";
export declare class GmailOAuthController {
    private readonly gmailService;
    constructor(gmailService: GmailService);
    authorizationUrl(): {
        authorizationUrl: string;
        redirectUri: string;
    };
    callback(code?: string, error?: string): Promise<{
        ok: boolean;
        error: string;
        message?: undefined;
        env?: undefined;
    } | {
        ok: boolean;
        message: string;
        env: string;
        error?: undefined;
    }>;
}
