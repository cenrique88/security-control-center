import { ServiceType } from "@prisma/client";
import { DevicesService } from "./devices.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    list(search?: string, customerId?: string, siteId?: string, type?: ServiceType): Promise<({
        site: {
            customer: {
                id: string;
                name: string;
            };
            id: string;
            name: string;
            address: string;
        };
        inventoryMovements: {
            workOrder: {
                id: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
            } | null;
            id: string;
            createdAt: Date;
            workOrderId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        model: string | null;
        siteId: string;
        brand: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    })[]>;
    create(dto: CreateDeviceDto): Promise<{
        site: {
            customer: {
                id: string;
                name: string;
            };
            id: string;
            name: string;
            address: string;
        };
        inventoryMovements: {
            workOrder: {
                id: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
            } | null;
            id: string;
            createdAt: Date;
            workOrderId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        model: string | null;
        siteId: string;
        brand: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    }>;
}
