import { MeetingAttachmentDto } from "./create-meeting.dto";
export declare class UpdateMeetingDto {
    customerId?: string;
    dateTime?: string;
    contact?: string;
    type?: "IN_PERSON" | "VIDEO_CALL" | "PHONE";
    status?: "PENDING" | "DONE" | "CANCELLED";
    objective?: string;
    notes?: string;
    commitments?: string;
    nextStep?: string;
    followUpDate?: string;
    attendees?: string;
    needs?: string;
    equipmentNeeded?: string;
    estimatedBudget?: number;
    closeProbability?: number;
    reminderEnabled?: boolean;
    reminderMinutesBefore?: number;
    attachments?: MeetingAttachmentDto[];
}
