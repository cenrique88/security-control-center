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
            reference: string;
            name: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
        } | null;
        movements: ({
            customer: {
                id: string;
                name: string;
            } | null;
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
            payment: {
                id: string;
                currency: string;
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            } | null;
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
            reference: string;
            name: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
        } | null;
        movements: ({
            customer: {
                id: string;
                name: string;
            } | null;
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
            payment: {
                id: string;
                currency: string;
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            } | null;
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
    }>;
    updateItem(id: string, dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            reference: string;
            name: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.CustomerType;
            status: import(".prisma/client").$Enums.CustomerStatus;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
        } | null;
        movements: ({
            customer: {
                id: string;
                name: string;
            } | null;
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
                brand: string | null;
                model: string | null;
                serial: string | null;
            } | null;
            payment: {
                id: string;
                currency: string;
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date | null;
            } | null;
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
    }>;
    createMovement(dto: CreateInventoryMovementDto): Promise<{
        customer: {
            id: string;
            name: string;
        } | null;
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
            brand: string | null;
            model: string | null;
            serial: string | null;
        } | null;
        payment: {
            id: string;
            currency: string;
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
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
    }>;
    deleteMovement(id: string): Promise<{
        customer: {
            id: string;
            name: string;
        } | null;
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
            brand: string | null;
            model: string | null;
            serial: string | null;
        } | null;
        payment: {
            id: string;
            currency: string;
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
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
    }>;
    deleteItem(id: string): Promise<{
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
    }>;
}
