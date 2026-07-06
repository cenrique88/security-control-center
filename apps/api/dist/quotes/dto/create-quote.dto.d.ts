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
declare enum QuoteItemTypeDto {
    EQUIPMENT = "EQUIPMENT",
    MATERIAL = "MATERIAL",
    SUPPLY = "SUPPLY",
    LABOR = "LABOR",
    EXPENSE = "EXPENSE"
}
export declare class CreateQuoteItemDto {
    priceBookItemId?: string;
    type: QuoteItemTypeDto;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate?: number;
    unitCost?: number;
}
export declare class CreateQuoteDto {
    customerId: string;
    meetingId?: string;
    number?: string;
    title: string;
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
    internalNotes?: string;
    commercialTerms?: string;
    executionTime?: string;
    warranty?: string;
    paymentTerms?: string;
    items?: CreateQuoteItemDto[];
}
export {};
