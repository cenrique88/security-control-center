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
export declare class CreateInventoryItemDto {
    sku?: string;
    name: string;
    category?: ServiceTypeDto;
    unit?: string;
    stock?: number;
    minStock?: number;
    managedStock?: boolean;
    location?: string;
    supplier?: string;
    supplierCategory?: string;
    costPrice?: number;
    taxAmount?: number;
    priceWithTax?: number;
    currency?: string;
    notes?: string;
}
export {};
