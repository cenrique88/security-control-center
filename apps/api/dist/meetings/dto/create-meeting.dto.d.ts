export declare class MeetingAttachmentDto {
    name: string;
    mimeType?: string;
    size?: number;
    dataUrl: string;
}
export declare class CreateMeetingDto {
    customerId: string;
    dateTime: string;
    contact?: string;
    type: "IN_PERSON" | "VIDEO_CALL" | "PHONE";
    status?: "PENDING" | "DONE" | "CANCELLED";
    objective: string;
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
