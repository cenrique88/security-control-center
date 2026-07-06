import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";
import { UpdateDailySummaryDto } from "./dto/update-daily-summary.dto";
import { WhatsAppService } from "./whatsapp.service";
export declare class WhatsAppController {
    private readonly whatsAppService;
    constructor(whatsAppService: WhatsAppService);
    status(): Promise<{
        provider: string;
        connected: boolean;
        lastSyncAt: null;
        unread: number;
        pendingReplies: number;
        activeChats: number;
        checks: {
            key: string;
            label: string;
            configured: boolean;
        }[];
        connectionError: string;
    }>;
    sync(): Promise<{
        provider: string;
        connected: boolean;
        lastSyncAt: string;
        unread: number;
        pendingReplies: number;
        activeChats: number;
        session: {
            id: string;
            name: string;
            status?: string;
            phone?: string;
            pushName?: string;
            connectedAt?: string | null;
            lastActive?: string | null;
        };
        stats: Record<string, unknown>;
        chats: {
            id: string;
            name?: string;
            isGroup?: boolean;
            unreadCount?: number;
            timestamp?: number;
            lastMessage?: string;
            labels?: Array<string | {
                name?: string;
                label?: string;
                title?: string;
            }>;
            label?: string;
            category?: string;
            type?: string;
        }[];
        groups: {
            id: string;
            name?: string;
            labels?: Array<string | {
                name?: string;
                label?: string;
                title?: string;
            }>;
            label?: string;
            category?: string;
        }[];
    }>;
    send(dto: SendWhatsAppMessageDto): Promise<{
        provider: string;
        sent: boolean;
        to: string;
        sentAt: string;
        result: Record<string, unknown>;
    }>;
    dailyMeetingSummary(): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            enabled: boolean;
            recipientName: string | null;
            recipientPhone: string;
            sendTime: string;
            messageTemplate: string;
            lastSentForDate: string | null;
            lastSentAt: Date | null;
        };
        preview: {
            dateKey: string;
            dateLabel: string;
            meetingsCount: number;
            meetings: ({
                customer: {
                    name: string;
                    email: string | null;
                    phone: string | null;
                };
            } & {
                id: string;
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                dateTime: Date;
                contact: string | null;
                objective: string;
                commitments: string | null;
                nextStep: string | null;
                followUpDate: Date | null;
                attendees: string | null;
                needs: string | null;
                equipmentNeeded: string | null;
                estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
                closeProbability: number | null;
                reminderEnabled: boolean;
                reminderMinutesBefore: number;
                reminderSentAt: Date | null;
            })[];
            message: string;
        };
    }>;
    updateDailyMeetingSummary(dto: UpdateDailySummaryDto): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            enabled: boolean;
            recipientName: string | null;
            recipientPhone: string;
            sendTime: string;
            messageTemplate: string;
            lastSentForDate: string | null;
            lastSentAt: Date | null;
        };
        preview: {
            dateKey: string;
            dateLabel: string;
            meetingsCount: number;
            meetings: ({
                customer: {
                    name: string;
                    email: string | null;
                    phone: string | null;
                };
            } & {
                id: string;
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                dateTime: Date;
                contact: string | null;
                objective: string;
                commitments: string | null;
                nextStep: string | null;
                followUpDate: Date | null;
                attendees: string | null;
                needs: string | null;
                equipmentNeeded: string | null;
                estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
                closeProbability: number | null;
                reminderEnabled: boolean;
                reminderMinutesBefore: number;
                reminderSentAt: Date | null;
            })[];
            message: string;
        };
    }>;
    sendDailyMeetingSummary(): Promise<{
        settings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            enabled: boolean;
            recipientName: string | null;
            recipientPhone: string;
            sendTime: string;
            messageTemplate: string;
            lastSentForDate: string | null;
            lastSentAt: Date | null;
        };
        preview: {
            dateKey: string;
            dateLabel: string;
            meetingsCount: number;
            meetings: ({
                customer: {
                    name: string;
                    email: string | null;
                    phone: string | null;
                };
            } & {
                id: string;
                customerId: string;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.MeetingType;
                status: import(".prisma/client").$Enums.MeetingStatus;
                dateTime: Date;
                contact: string | null;
                objective: string;
                commitments: string | null;
                nextStep: string | null;
                followUpDate: Date | null;
                attendees: string | null;
                needs: string | null;
                equipmentNeeded: string | null;
                estimatedBudget: import("@prisma/client/runtime/library").Decimal | null;
                closeProbability: number | null;
                reminderEnabled: boolean;
                reminderMinutesBefore: number;
                reminderSentAt: Date | null;
            })[];
            message: string;
        };
        sent: boolean;
    }>;
}
