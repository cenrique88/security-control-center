import { ConfigService } from "@nestjs/config";
import { SendGmailMessageDto } from "./dto/send-gmail-message.dto";
export declare class GmailService {
    private readonly config;
    constructor(config: ConfigService);
    status(): {
        provider: string;
        connected: boolean;
        lastSyncAt: null;
        unread: number;
        important: number;
        pendingReplies: number;
        checks: {
            key: string;
            label: string;
            configured: boolean;
        }[];
    };
    sync(): Promise<{
        provider: string;
        connected: boolean;
        lastSyncAt: string;
        emailAddress: string;
        unread: number;
        important: number;
        pendingReplies: number;
        messagesTotal: number;
        threadsTotal: number;
        messages: {
            id: string;
            threadId: string;
            from: string;
            subject: string;
            date: string;
            snippet: string;
            unread: boolean;
            important: boolean;
        }[];
    }>;
    send(dto: SendGmailMessageDto): Promise<{
        provider: string;
        sent: boolean;
        to: string;
        subject: string;
        sentAt: string;
        messageId: string;
        threadId: string | undefined;
    }>;
    private buildRawMessage;
    private parseDataUrl;
    private wrapBase64;
    private escapeHeader;
    getAuthorizationUrl(): {
        authorizationUrl: string;
        redirectUri: string;
    };
    completeOAuth(code: string): Promise<{
        refreshToken: string;
    }>;
    private getAccessToken;
    private listMessages;
    private getMessage;
    private gmailRequest;
    private toMessageSummary;
    private toBase64Url;
    private encodeHeader;
}
