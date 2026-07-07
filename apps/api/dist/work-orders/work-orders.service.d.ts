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
            email: string | null;
            name: string;
            phone: string | null;
            taxId: string | null;
            reference: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            quantity: number;
            stockAfter: number;
            reason: string | null;
            itemId: string;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        notes: string | null;
        title: string;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        siteId: string | null;
        customerId: string;
    })[]>;
    create(dto: CreateWorkOrderDto): Promise<{
        customer: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            taxId: string | null;
            reference: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            quantity: number;
            stockAfter: number;
            reason: string | null;
            itemId: string;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        notes: string | null;
        title: string;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        siteId: string | null;
        customerId: string;
    }>;
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            taxId: string | null;
            reference: string;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            quantity: number;
            stockAfter: number;
            reason: string | null;
            itemId: string;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        notes: string | null;
        title: string;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        siteId: string | null;
        customerId: string;
    }>;
    addMaterial(id: string, dto: AddWorkOrderMaterialDto): Promise<({
        workOrder: {
            customer: {
                id: string;
                name: string;
            };
            id: string;
            title: string;
        } | null;
        installedDevice: {
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
        } | null;
        item: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            notes: string | null;
            customerId: string | null;
            currency: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            costPrice: Prisma.Decimal | null;
            sku: string | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        customerId: string | null;
        workOrderId: string | null;
        sourceType: string | null;
        quantity: number;
        stockAfter: number;
        reason: string | null;
        itemId: string;
        installedDeviceId: string | null;
    }) | ({
        workOrder: {
            customer: {
                id: string;
                name: string;
            };
            id: string;
            title: string;
        } | null;
        installedDevice: {
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
        } | null;
        item: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            notes: string | null;
            customerId: string | null;
            currency: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            costPrice: Prisma.Decimal | null;
            sku: string | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        customerId: string | null;
        workOrderId: string | null;
        sourceType: string | null;
        quantity: number;
        stockAfter: number;
        reason: string | null;
        itemId: string;
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
