import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";
import { UpdateDailySummaryDto } from "./dto/update-daily-summary.dto";
type OpenWaSession = {
    id: string;
    name: string;
    status?: string;
    phone?: string;
    pushName?: string;
    connectedAt?: string | null;
    lastActive?: string | null;
};
type OpenWaChat = {
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
};
type OpenWaGroup = {
    id: string;
    name?: string;
    labels?: Array<string | {
        name?: string;
        label?: string;
        title?: string;
    }>;
    label?: string;
    category?: string;
};
export declare class WhatsAppService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private dailySummaryTimer?;
    private dailySummaryRunning;
    constructor(config: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    onModuleDestroy(): void;
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
        session: OpenWaSession;
        stats: Record<string, unknown>;
        chats: OpenWaChat[];
        groups: OpenWaGroup[];
    }>;
    send(dto: SendWhatsAppMessageDto): Promise<{
        provider: string;
        sent: boolean;
        to: string;
        sentAt: string;
        result: Record<string, unknown>;
    }>;
    getDailyMeetingSummary(): Promise<{
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
                    phone: string | null;
                    email: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.MeetingStatus;
                type: import(".prisma/client").$Enums.MeetingType;
                notes: string | null;
                customerId: string;
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
                    phone: string | null;
                    email: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.MeetingStatus;
                type: import(".prisma/client").$Enums.MeetingType;
                notes: string | null;
                customerId: string;
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
    sendDailyMeetingSummaryNow(): Promise<{
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
                    phone: string | null;
                    email: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.MeetingStatus;
                type: import(".prisma/client").$Enums.MeetingType;
                notes: string | null;
                customerId: string;
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
    private sendDailyMeetingSummaryIfDue;
    private getOrCreateDailySummarySettings;
    private buildDailyMeetingSummaryPreview;
    private tomorrowRange;
    private formatMeetingSummaryLine;
    private meetingTypeLabel;
    private openWaRequest;
    private safeOpenWaRequest;
    private openWaSend;
    private tryOpenWaSend;
    private restartOpenWaSession;
    private sleep;
    private responseFailureDetail;
    private safeJson;
    private fetchWithTimeout;
    private normalizePhone;
    private cleanNullable;
}
export {};
