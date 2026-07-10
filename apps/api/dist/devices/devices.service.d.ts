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
        siteId: string;
        brand: string | null;
        model: string | null;
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
        siteId: string;
        brand: string | null;
        model: string | null;
        serial: string | null;
        ipAddress: string | null;
        installedAt: Date | null;
    }>;
    private cleanOptional;
}
export {};
