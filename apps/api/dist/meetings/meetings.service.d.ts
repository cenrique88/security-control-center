import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MeetingStatus, MeetingType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { UpdateMeetingDto } from "./dto/update-meeting.dto";
type MeetingFilters = {
    search?: string;
    customerId?: string;
    type?: MeetingType;
    status?: MeetingStatus;
};
export declare class MeetingsService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly whatsAppService;
    private readonly config;
    private readonly logger;
    private reminderTimer?;
    private reminderRunning;
    constructor(prisma: PrismaService, whatsAppService: WhatsAppService, config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    list(filters: MeetingFilters): Promise<({
        customer: {
            id: string;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
        };
        attachments: {
            id: string;
            createdAt: Date;
            name: string;
            meetingId: string;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
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
        estimatedBudget: Prisma.Decimal | null;
        closeProbability: number | null;
        reminderEnabled: boolean;
        reminderMinutesBefore: number;
        reminderSentAt: Date | null;
    })[]>;
    create(dto: CreateMeetingDto): Promise<{
        customer: {
            id: string;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
        };
        attachments: {
            id: string;
            createdAt: Date;
            name: string;
            meetingId: string;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
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
        estimatedBudget: Prisma.Decimal | null;
        closeProbability: number | null;
        reminderEnabled: boolean;
        reminderMinutesBefore: number;
        reminderSentAt: Date | null;
    }>;
    update(id: string, dto: UpdateMeetingDto): Promise<{
        customer: {
            id: string;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
        };
        attachments: {
            id: string;
            createdAt: Date;
            name: string;
            meetingId: string;
            mimeType: string | null;
            size: number | null;
            dataUrl: string;
        }[];
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
        estimatedBudget: Prisma.Decimal | null;
        closeProbability: number | null;
        reminderEnabled: boolean;
        reminderMinutesBefore: number;
        reminderSentAt: Date | null;
    }>;
    private includeRelations;
    private sendDueWhatsAppReminders;
    private buildReminderMessage;
    private formatMeetingDate;
    private meetingTypeLabel;
    private toAttachmentCreateData;
    private ensureCustomer;
    private cleanOptional;
    private cleanNullable;
}
export {};
