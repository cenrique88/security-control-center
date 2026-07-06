import { Prisma, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
type InventoryFilters = {
    search?: string;
    category?: ServiceType;
    lowStock?: string;
    supplier?: string;
    mode?: "catalog" | "stock" | "all";
};
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: InventoryFilters): Promise<{
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
    }[]>;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
    }>;
    summary(): Promise<{
        totalItems: number;
        lowStock: number;
        outOfStock: number;
        movements: number;
        installed: number;
        availableStock: number;
    }>;
    private installedQuantityByItem;
    private movementInclude;
    private nextReference;
    private ensureWorkOrder;
    private ensureInstalledDevice;
    private handleDatabaseError;
    private cleanOptional;
    private cleanNullable;
}
export {};
