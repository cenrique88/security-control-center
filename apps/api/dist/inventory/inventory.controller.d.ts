import { ServiceType } from "@prisma/client";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
import { InventoryService } from "./inventory.service";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(search?: string, category?: ServiceType, lowStock?: string, supplier?: string, mode?: "catalog" | "stock" | "all"): Promise<{
        installedQuantity: number;
        movements: ({
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
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
        movements: ({
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
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
    }>;
    updateItem(id: string, dto: CreateInventoryItemDto): Promise<{
        movements: ({
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
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
    }>;
    createMovement(dto: CreateInventoryMovementDto): Promise<{
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
            brand: string | null;
            model: string | null;
            serial: string | null;
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
    }>;
    deleteMovement(id: string): Promise<{
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
            brand: string | null;
            model: string | null;
            serial: string | null;
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
    }>;
    deleteItem(id: string): Promise<{
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
    }>;
}
