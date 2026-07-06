import { Prisma, ServiceType, WorkOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddWorkOrderMaterialDto } from "./dto/add-work-order-material.dto";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";
type WorkOrderFilters = {
    search?: string;
    customerId?: string;
    siteId?: string;
    type?: ServiceType;
    status?: WorkOrderStatus;
};
export declare class WorkOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: WorkOrderFilters): Promise<({
        customer: {
            id: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
            taxId: string | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                name: string;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            name: string;
            traccarGeofenceId: number | null;
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                brand: string | null;
                model: string | null;
                serial: string | null;
                ipAddress: string | null;
            } | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        } & {
            id: string;
            workOrderId: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            itemId: string;
            quantity: number;
            stockAfter: number;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        title: string;
        customerId: string;
        siteId: string | null;
        scheduledAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        completedAt: Date | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    })[]>;
    create(dto: CreateWorkOrderDto): Promise<{
        customer: {
            id: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
            taxId: string | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                name: string;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            name: string;
            traccarGeofenceId: number | null;
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                brand: string | null;
                model: string | null;
                serial: string | null;
                ipAddress: string | null;
            } | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        } & {
            id: string;
            workOrderId: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            itemId: string;
            quantity: number;
            stockAfter: number;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        title: string;
        customerId: string;
        siteId: string | null;
        scheduledAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        completedAt: Date | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    }>;
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            name: string;
            reference: string;
            email: string | null;
            phone: string | null;
            taxId: string | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                name: string;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            name: string;
            traccarGeofenceId: number | null;
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                brand: string | null;
                model: string | null;
                serial: string | null;
                ipAddress: string | null;
            } | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        } & {
            id: string;
            workOrderId: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            itemId: string;
            quantity: number;
            stockAfter: number;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        title: string;
        customerId: string;
        siteId: string | null;
        scheduledAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        completedAt: Date | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    }>;
    addMaterial(id: string, dto: AddWorkOrderMaterialDto): Promise<({
        workOrder: {
            id: string;
            title: string;
            customer: {
                id: string;
                name: string;
            };
        } | null;
        installedDevice: {
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
        } | null;
        item: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            reference: string;
            sku: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
            currency: string | null;
        };
    } & {
        id: string;
        workOrderId: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        itemId: string;
        quantity: number;
        stockAfter: number;
        reason: string | null;
        installedDeviceId: string | null;
    }) | ({
        workOrder: {
            id: string;
            title: string;
            customer: {
                id: string;
                name: string;
            };
        } | null;
        installedDevice: {
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
        } | null;
        item: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            reference: string;
            sku: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
            currency: string | null;
        };
    } & {
        id: string;
        workOrderId: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        itemId: string;
        quantity: number;
        stockAfter: number;
        reason: string | null;
        installedDeviceId: string | null;
    })[]>;
    private includeRelations;
    private ensureCustomer;
    private ensureSiteBelongsToCustomer;
    private ensureWorkOrderSite;
    private cleanOptional;
    private cleanNullable;
}
export {};
