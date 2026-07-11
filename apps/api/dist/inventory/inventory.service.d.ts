import { Prisma, ServiceType } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
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
    duplicate?: {
        exists: boolean;
        paymentId?: string;
        importedAt?: string;
        message: string;
        products: string[];
    };
};
export declare class InventoryService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(filters: InventoryFilters): Promise<{
        installedQuantity: number;
        customer: {
            id: string;
            name: string;
            logoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            phone: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
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
                model: string | null;
                brand: string | null;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            currency: string | null;
            quoteId: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            itemId: string;
            paymentId: string | null;
            installedDeviceId: string | null;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string;
        notes: string | null;
        customerId: string | null;
        sku: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
    }[]>;
    createItem(dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            name: string;
            logoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            phone: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
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
                model: string | null;
                brand: string | null;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            currency: string | null;
            quoteId: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            itemId: string;
            paymentId: string | null;
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
        sku: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
    }>;
    updateItem(id: string, dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            name: string;
            logoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            phone: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
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
                model: string | null;
                brand: string | null;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            currency: string | null;
            quoteId: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            itemId: string;
            paymentId: string | null;
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
        sku: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: Prisma.Decimal | null;
        taxAmount: Prisma.Decimal | null;
        priceWithTax: Prisma.Decimal | null;
        currency: string | null;
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
            model: string | null;
            brand: string | null;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            notes: string | null;
            customerId: string | null;
            sku: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
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
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        customerId: string | null;
        workOrderId: string | null;
        sourceType: string | null;
        currency: string | null;
        quoteId: string | null;
        quantity: number;
        stockAfter: number;
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        itemId: string;
        paymentId: string | null;
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
                model: string | null;
                brand: string | null;
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
                name: string;
                createdAt: Date;
                updatedAt: Date;
                reference: string;
                notes: string | null;
                customerId: string | null;
                sku: string | null;
                category: import(".prisma/client").$Enums.ServiceType | null;
                unit: string;
                stock: number;
                minStock: number;
                managedStock: boolean;
                sourceType: string;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            currency: string | null;
            quoteId: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            itemId: string;
            paymentId: string | null;
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
            model: string | null;
            brand: string | null;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            notes: string | null;
            customerId: string | null;
            sku: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
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
        createdAt: Date;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        customerId: string | null;
        workOrderId: string | null;
        sourceType: string | null;
        currency: string | null;
        quoteId: string | null;
        quantity: number;
        stockAfter: number;
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        itemId: string;
        paymentId: string | null;
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
        sku: string | null;
        category: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
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
    previewInvoice(dto: ImportInvoiceDto): Promise<ParsedInvoice>;
    importInvoice(dto: ImportInvoiceDto): Promise<{
        importer: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        paymentId: string;
        movements: never[];
        invoice: ParsedInvoice;
        importMode: string;
    } | {
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
                model: string | null;
                brand: string | null;
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
                name: string;
                createdAt: Date;
                updatedAt: Date;
                reference: string;
                notes: string | null;
                customerId: string | null;
                sku: string | null;
                category: import(".prisma/client").$Enums.ServiceType | null;
                unit: string;
                stock: number;
                minStock: number;
                managedStock: boolean;
                sourceType: string;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            customerId: string | null;
            workOrderId: string | null;
            sourceType: string | null;
            currency: string | null;
            quoteId: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            itemId: string;
            paymentId: string | null;
            installedDeviceId: string | null;
        })[];
        invoice: ParsedInvoice;
        importMode?: undefined;
    }>;
    private withInvoiceDuplicateStatus;
    private findDuplicateInvoice;
    private installedQuantityByItem;
    private extractInvoiceText;
    private runPython;
    private parseInvoiceText;
    private parseInvoiceItems;
    private findProviderName;
    private findOrCreateImporter;
    private resolveInventoryFinanceCustomer;
    private resolveMovementFinanceCustomer;
    private resolveInternalOperationsCustomer;
    private findOrCreateInvoiceItem;
    private nextCustomerReference;
    private parseInvoiceDate;
    private numberAfterLabel;
    private firstMatch;
    private parseLocalNumber;
    private roundMoney;
    private resolveMovementUnitCost;
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
