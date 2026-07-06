declare class MessageAttachmentDto {
    name: string;
    mimeType: string;
    dataUrl: string;
}
export declare class SendGmailMessageDto {
    to: string;
    subject: string;
    message: string;
    attachment?: MessageAttachmentDto;
    workOrderId?: string;
    customerId?: string;
}
export {};
