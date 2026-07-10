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
declare enum WorkOrderStatusDto {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    WAITING_CUSTOMER = "WAITING_CUSTOMER",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class CreateWorkOrderDto {
    customerId: string;
    siteId?: string;
    title: string;
    type: ServiceTypeDto;
    status?: WorkOrderStatusDto;
    scheduledAt?: string;
    completedAt?: string;
    notes?: string;
    reportType?: string;
    reportBeforeNotes?: string;
    reportAfterNotes?: string;
    reportTasks?: string;
    reportTests?: string;
    reportRecommendations?: string;
    reportPhotos?: unknown[];
}
export {};
