import { Prisma, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementBatchDto, CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
import { ImportInvoiceDto } from "./dto/import-invoice.dto";
type InventoryFilters = {
    search?: string;
    category?: ServiceType;
    lowStock?: string;
    supplier?: string;
    customerId?: string;
    sourceType?: string;
    mode?: "catalog" | "stock" | "all" | "archived";
};
type ParsedInvoiceItem = {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    subtotal: number;
};
type ParsedInvoice = {
    providerName: string;
    providerTaxId?: string;
    providerAddress?: string;
    buyerName?: string;
    date?: string;
    currency: string;
    invoiceType?: string;
    series?: string;
    number?: string;
    reference: string;
    items: ParsedInvoiceItem[];
    totals: {
        subtotal: number;
        tax: number;
        total: number;
    };
    rawText: string;
    warnings?: string[];
    extractedTextLength?: number;
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
    createMovementBatch(dto: CreateInventoryMovementBatchDto): Promise<{
        paymentId: string | null;
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
        })[];
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
    previewInvoice(dto: ImportInvoiceDto): Promise<ParsedInvoice>;
    importInvoice(dto: ImportInvoiceDto): Promise<{
        importer: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        paymentId: string;
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
        })[];
        invoice: ParsedInvoice;
    }>;
    private installedQuantityByItem;
    private extractInvoiceText;
    private runPython;
    private parseInvoiceText;
    private parseInvoiceItems;
    private findProviderName;
    private findOrCreateImporter;
    private findOrCreateInvoiceItem;
    private nextCustomerReference;
    private parseInvoiceDate;
    private numberAfterLabel;
    private firstMatch;
    private parseLocalNumber;
    private roundMoney;
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
