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
export declare class CreateDeviceDto {
    siteId: string;
    type: ServiceTypeDto;
    brand?: string;
    model?: string;
    serial?: string;
    ipAddress?: string;
    installedAt?: string;
    notes?: string;
}
export {};
