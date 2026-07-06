import { CreateQuoteItemDto } from "./create-quote.dto";
declare enum ServiceTypeDto {
    CCTV = "CCTV",
    ALARM = "ALARM",
    ACCESS_CONTROL = "ACCESS_CONTROL",
    CABLING = "CABLING",
    GPS = "GPS",
    ELECTRIC_FENCE = "ELECTRIC_FENCE",
    AUTOMATION = "AUTOMATION",
    NETWORKING = "NETWORKING",
    MAINTENANCE = "MAINTENANCE",
    OTHER = "OTHER"
}
declare enum QuoteStatusDto {
    DRAFT = "DRAFT",
    SENT = "SENT",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
declare enum QuotePricingModeDto {
    DIRECT = "DIRECT",
    THIRD_PARTY = "THIRD_PARTY",
    MANUAL = "MANUAL"
}
export declare class UpdateQuoteDto {
    customerId?: string;
    number?: string;
    title?: string;
    meetingId?: string;
    service?: ServiceTypeDto;
    status?: QuoteStatusDto;
    pricingMode?: QuotePricingModeDto;
    currency?: string;
    issueDate?: string;
    validUntil?: string;
    taxIncluded?: boolean;
    discountPercent?: number;
    discountAmount?: number;
    profitMarginPercent?: number;
    laborPoints?: number;
    subtotal?: number;
    tax?: number;
    acceptedAt?: string;
    internalNotes?: string;
    commercialTerms?: string;
    executionTime?: string;
    warranty?: string;
    paymentTerms?: string;
    items?: CreateQuoteItemDto[];
}
export {};
