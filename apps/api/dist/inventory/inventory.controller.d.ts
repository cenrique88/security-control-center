import { ServiceType } from "@prisma/client";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementBatchDto, CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
import { ImportInvoiceDto } from "./dto/import-invoice.dto";
import { InventoryService } from "./inventory.service";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    list(search?: string, category?: ServiceType, lowStock?: string, supplier?: string, customerId?: string, sourceType?: string, mode?: "catalog" | "stock" | "all" | "archived"): Promise<{
        installedQuantity: number;
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            email: string | null;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CustomerStatus;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
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
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
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
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                paidAt: Date | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            customerId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quoteId: string | null;
            workOrderId: string | null;
            quantity: number;
            currency: string | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string | null;
        notes: string | null;
        reference: string;
        category: import(".prisma/client").$Enums.ServiceType | null;
        currency: string | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
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
    previewInvoice(dto: ImportInvoiceDto): Promise<{
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
        items: {
            description: string;
            quantity: number;
            unit: string;
            unitPrice: number;
            taxRate: number;
            subtotal: number;
        }[];
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
    }>;
    importInvoice(dto: ImportInvoiceDto): Promise<{
        importer: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        paymentId: string;
        movements: never[];
        invoice: {
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
            items: {
                description: string;
                quantity: number;
                unit: string;
                unitPrice: number;
                taxRate: number;
                subtotal: number;
            }[];
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
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
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
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                paidAt: Date | null;
            } | null;
            item: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                customerId: string | null;
                notes: string | null;
                reference: string;
                category: import(".prisma/client").$Enums.ServiceType | null;
                currency: string | null;
                sku: string | null;
                unit: string;
                stock: number;
                minStock: number;
                managedStock: boolean;
                sourceType: string;
                location: string | null;
                supplier: string | null;
                supplierCategory: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                taxAmount: import("@prisma/client/runtime/library").Decimal | null;
                priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quoteId: string | null;
            workOrderId: string | null;
            quantity: number;
            currency: string | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
        invoice: {
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
            items: {
                description: string;
                quantity: number;
                unit: string;
                unitPrice: number;
                taxRate: number;
                subtotal: number;
            }[];
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
        importMode?: undefined;
    }>;
    createItem(dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            email: string | null;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CustomerStatus;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
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
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
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
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                paidAt: Date | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            customerId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quoteId: string | null;
            workOrderId: string | null;
            quantity: number;
            currency: string | null;
            sourceType: string | null;
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
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string | null;
        notes: string | null;
        reference: string;
        category: import(".prisma/client").$Enums.ServiceType | null;
        currency: string | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateItem(id: string, dto: CreateInventoryItemDto): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            email: string | null;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CustomerStatus;
            type: import(".prisma/client").$Enums.CustomerType;
            notes: string | null;
            reference: string;
            legalName: string | null;
            taxId: string | null;
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
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
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
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                paidAt: Date | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            customerId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quoteId: string | null;
            workOrderId: string | null;
            quantity: number;
            currency: string | null;
            sourceType: string | null;
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
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string | null;
        notes: string | null;
        reference: string;
        category: import(".prisma/client").$Enums.ServiceType | null;
        currency: string | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            model: string | null;
            brand: string | null;
            serial: string | null;
        } | null;
        payment: {
            id: string;
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            paidAt: Date | null;
        } | null;
        item: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            customerId: string | null;
            notes: string | null;
            reference: string;
            category: import(".prisma/client").$Enums.ServiceType | null;
            currency: string | null;
            sku: string | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        customerId: string | null;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        quoteId: string | null;
        workOrderId: string | null;
        quantity: number;
        currency: string | null;
        sourceType: string | null;
        itemId: string;
        paymentId: string | null;
        stockAfter: number;
        unitCost: import("@prisma/client/runtime/library").Decimal | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
                customer: {
                    id: string;
                    name: string;
                };
                id: string;
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
                concept: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                paidAt: Date | null;
            } | null;
            item: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                customerId: string | null;
                notes: string | null;
                reference: string;
                category: import(".prisma/client").$Enums.ServiceType | null;
                currency: string | null;
                sku: string | null;
                unit: string;
                stock: number;
                minStock: number;
                managedStock: boolean;
                sourceType: string;
                location: string | null;
                supplier: string | null;
                supplierCategory: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                taxAmount: import("@prisma/client/runtime/library").Decimal | null;
                priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quoteId: string | null;
            workOrderId: string | null;
            quantity: number;
            currency: string | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            customer: {
                id: string;
                name: string;
            };
            id: string;
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
            concept: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            paidAt: Date | null;
        } | null;
        item: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            customerId: string | null;
            notes: string | null;
            reference: string;
            category: import(".prisma/client").$Enums.ServiceType | null;
            currency: string | null;
            sku: string | null;
            unit: string;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        customerId: string | null;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        quoteId: string | null;
        workOrderId: string | null;
        quantity: number;
        currency: string | null;
        sourceType: string | null;
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
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string | null;
        notes: string | null;
        reference: string;
        category: import(".prisma/client").$Enums.ServiceType | null;
        currency: string | null;
        sku: string | null;
        unit: string;
        stock: number;
        minStock: number;
        managedStock: boolean;
        sourceType: string;
        location: string | null;
        supplier: string | null;
        supplierCategory: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        priceWithTax: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
