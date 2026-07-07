import { ServiceType } from "@prisma/client";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
import { InventoryService } from "./inventory.service";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(search?: string, category?: ServiceType, lowStock?: string, supplier?: string, customerId?: string, sourceType?: string, mode?: "catalog" | "stock" | "all"): Promise<{
        installedQuantity: number;
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            taxId: string | null;
            legalName: string | null;
            reference: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
        } | null;
        movements: ({
            customer: {
                id: string;
                name: string;
            } | null;
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
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
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        customerId: string | null;
        currency: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    summary(): Promise<{
        totalItems: number;
        lowStock: number;
        outOfStock: number;
        movements: number;
        installed: number;
        availableStock: number;
    }>;
    createItem(dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            taxId: string | null;
            legalName: string | null;
            reference: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
        } | null;
        movements: ({
            customer: {
                id: string;
                name: string;
            } | null;
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        customerId: string | null;
        currency: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateItem(id: string, dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            taxId: string | null;
            legalName: string | null;
            reference: string;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
        } | null;
        movements: ({
            customer: {
                id: string;
                name: string;
            } | null;
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        customerId: string | null;
        currency: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    createMovement(dto: CreateInventoryMovementDto): Promise<{
        customer: {
            id: string;
            name: string;
        } | null;
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
            brand: string | null;
            model: string | null;
            serial: string | null;
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
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
    deleteMovement(id: string): Promise<{
        customer: {
            id: string;
            name: string;
        } | null;
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
            brand: string | null;
            model: string | null;
            serial: string | null;
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
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
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
    }>;
    deleteItem(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        customerId: string | null;
        currency: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
