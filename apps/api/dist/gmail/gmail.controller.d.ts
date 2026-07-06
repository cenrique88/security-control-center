import { SendGmailMessageDto } from "./dto/send-gmail-message.dto";
import { GmailService } from "./gmail.service";
export declare class GmailController {
    private readonly gmailService;
    constructor(gmailService: GmailService);
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
}
