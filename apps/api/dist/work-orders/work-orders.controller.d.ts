import { ServiceType, WorkOrderStatus } from "@prisma/client";
import { AddWorkOrderMaterialDto } from "./dto/add-work-order-material.dto";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";
import { WorkOrdersService } from "./work-orders.service";
export declare class WorkOrdersController {
    private readonly workOrdersService;
    constructor(workOrdersService: WorkOrdersService);
    list(search?: string, customerId?: string, siteId?: string, type?: ServiceType, status?: WorkOrderStatus): Promise<({
        customer: {
            id: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                name: string;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    create(dto: CreateWorkOrderDto): Promise<{
        customer: {
            id: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                name: string;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
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
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
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
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                name: string;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
        reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
