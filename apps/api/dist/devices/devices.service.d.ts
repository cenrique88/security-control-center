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
            address: string;
            name: string;
            customer: {
                id: string;
                name: string;
            };
        };
        inventoryMovements: {
            id: string;
            workOrderId: string | null;
            createdAt: Date;
            workOrder: {
                id: string;
                title: string;
                scheduledAt: Date | null;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                completedAt: Date | null;
            } | null;
        }[];
    } & {
        id: string;
        siteId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
            address: string;
            name: string;
            customer: {
                id: string;
                name: string;
            };
        };
        inventoryMovements: {
            id: string;
            workOrderId: string | null;
            createdAt: Date;
            workOrder: {
                id: string;
                title: string;
                scheduledAt: Date | null;
                status: import(".prisma/client").$Enums.WorkOrderStatus;
                completedAt: Date | null;
            } | null;
        }[];
    } & {
        id: string;
        siteId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
