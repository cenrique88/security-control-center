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
declare enum QuoteItemTypeDto {
    EQUIPMENT = "EQUIPMENT",
    MATERIAL = "MATERIAL",
    SUPPLY = "SUPPLY",
    LABOR = "LABOR",
    EXPENSE = "EXPENSE"
}
export declare class UpsertPriceBookItemDto {
    code: string;
    name: string;
    type?: QuoteItemTypeDto;
    category: string;
    service?: ServiceTypeDto;
    brand?: string;
    model?: string;
    description?: string;
    unit?: string;
    costPrice?: number;
    salePrice?: number;
    taxRate?: number;
    currency?: string;
    active?: boolean;
}
export {};
