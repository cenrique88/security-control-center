import { Prisma, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
type InventoryFilters = {
    search?: string;
    category?: ServiceType;
    lowStock?: string;
    supplier?: string;
    customerId?: string;
    sourceType?: string;
    mode?: "catalog" | "stock" | "all";
};
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: InventoryFilters): Promise<{
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
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                amount: Prisma.Decimal;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
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
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                amount: Prisma.Decimal;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
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
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                amount: Prisma.Decimal;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
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
            amount: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
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
    private paymentCategoryFromSource;
    private nextReference;
    private ensureWorkOrder;
    private ensureCustomer;
    private ensureInstalledDevice;
    private handleDatabaseError;
    private cleanOptional;
    private cleanNullable;
}
export {};
