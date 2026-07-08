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
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
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
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
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
        unitCost: import("@prisma/client/runtime/library").Decimal | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
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
        unitCost: import("@prisma/client/runtime/library").Decimal | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        reason: string | null;
        installedDeviceId: string | null;
    })[]>;
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: import("@prisma/client/runtime/library").Decimal | null;
                longitude: import("@prisma/client/runtime/library").Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        reportPhotos: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
