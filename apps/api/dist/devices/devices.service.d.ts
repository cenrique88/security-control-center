import { ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
type DeviceFilters = {
    search?: string;
    customerId?: string;
    siteId?: string;
    type?: ServiceType;
};
export declare class DevicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: DeviceFilters): Promise<({
        inventoryMovements: {
            id: string;
            createdAt: Date;
            workOrderId: string | null;
            workOrder: {
                id: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
            } | null;
        }[];
        site: {
            id: string;
            name: string;
            customer: {
                id: string;
                name: string;
            };
            address: string;
        };
    } & {
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        siteId: string;
        brand: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    })[]>;
    create(dto: CreateDeviceDto): Promise<{
        inventoryMovements: {
            id: string;
            createdAt: Date;
            workOrderId: string | null;
            workOrder: {
                id: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                title: string;
                scheduledAt: Date | null;
                completedAt: Date | null;
            } | null;
        }[];
        site: {
            id: string;
            name: string;
            customer: {
                id: string;
                name: string;
            };
            address: string;
        };
    } & {
        id: string;
        model: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        siteId: string;
        brand: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    }>;
    private cleanOptional;
}
export {};
