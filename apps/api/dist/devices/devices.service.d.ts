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
        site: {
            id: string;
            name: string;
            customer: {
                id: string;
                name: string;
            };
            address: string;
        };
        inventoryMovements: {
            id: string;
            createdAt: Date;
            workOrder: {
                id: string;
                title: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                scheduledAt: Date | null;
                completedAt: Date | null;
            } | null;
            workOrderId: string | null;
        }[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        siteId: string;
        type: import(".prisma/client").$Enums.ServiceType;
        brand: string | null;
        model: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    })[]>;
    create(dto: CreateDeviceDto): Promise<{
        site: {
            id: string;
            name: string;
            customer: {
                id: string;
                name: string;
            };
            address: string;
        };
        inventoryMovements: {
            id: string;
            createdAt: Date;
            workOrder: {
                id: string;
                title: string;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                scheduledAt: Date | null;
                completedAt: Date | null;
            } | null;
            workOrderId: string | null;
        }[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        siteId: string;
        type: import(".prisma/client").$Enums.ServiceType;
        brand: string | null;
        model: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    }>;
    private cleanOptional;
}
export {};
