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
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
            phone: string | null;
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
                sku: string | null;
                name: string;
                unit: string;
            };
        } & {
            id: string;
            sourceType: string | null;
            customerId: string | null;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            workOrderId: string | null;
            quantity: number;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
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
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
            phone: string | null;
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
                sku: string | null;
                name: string;
                unit: string;
            };
        } & {
            id: string;
            sourceType: string | null;
            customerId: string | null;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            workOrderId: string | null;
            quantity: number;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
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
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
            phone: string | null;
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
                sku: string | null;
                name: string;
                unit: string;
            };
        } & {
            id: string;
            sourceType: string | null;
            customerId: string | null;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            workOrderId: string | null;
            quantity: number;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
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
            customer: {
                id: string;
                name: string;
            };
            title: string;
        } | null;
        installedDevice: {
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
        } | null;
        item: {
            id: string;
            reference: string;
            sku: string | null;
            name: string;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            customerId: string | null;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
            currency: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        sourceType: string | null;
        customerId: string | null;
        currency: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        workOrderId: string | null;
        quantity: number;
        itemId: string;
        paymentId: string | null;
        stockAfter: number;
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        installedDeviceId: string | null;
    }) | ({
        workOrder: {
            id: string;
            customer: {
                id: string;
                name: string;
            };
            title: string;
        } | null;
        installedDevice: {
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
        } | null;
        item: {
            id: string;
            reference: string;
            sku: string | null;
            name: string;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            customerId: string | null;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
            currency: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        sourceType: string | null;
        customerId: string | null;
        currency: string | null;
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        workOrderId: string | null;
        quantity: number;
        itemId: string;
        paymentId: string | null;
        stockAfter: number;
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
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
