import { MeetingStatus, MeetingType } from "@prisma/client";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { UpdateMeetingDto } from "./dto/update-meeting.dto";
import { MeetingsService } from "./meetings.service";
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    list(search?: string, customerId?: string, type?: MeetingType, status?: MeetingStatus): Promise<({
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MeetingStatus;
        customerId: string;
        dateTime: Date;
        contact: string | null;
        type: import(".prisma/client").$Enums.MeetingType;
        objective: string;
        notes: string | null;
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
    })[]>;
    create(dto: CreateMeetingDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MeetingStatus;
        customerId: string;
        dateTime: Date;
        contact: string | null;
        type: import(".prisma/client").$Enums.MeetingType;
        objective: string;
        notes: string | null;
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
    }>;
    update(id: string, dto: UpdateMeetingDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MeetingStatus;
        customerId: string;
        dateTime: Date;
        contact: string | null;
        type: import(".prisma/client").$Enums.MeetingType;
        objective: string;
        notes: string | null;
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
    }>;
}
