import { Prisma, ServiceType, WorkOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddWorkOrderMaterialDto } from "./dto/add-work-order-material.dto";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { ReturnWorkOrderMaterialDto } from "./dto/return-work-order-material.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";
type WorkOrderFilters = {
    search?: string;
    customerId?: string;
    siteId?: string;
    type?: ServiceType;
    status?: WorkOrderStatus;
};
export declare class WorkOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: WorkOrderFilters): Promise<({
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
            taxId: string | null;
            phone: string | null;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
        } | null;
        quote: {
            number: string;
            id: string;
            currency: string;
            title: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                inventoryItemId: string | null;
                category: string;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                total: Prisma.Decimal;
                unit: string;
                description: string;
            }[];
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                model: string | null;
                brand: string | null;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        quoteId: string | null;
        title: string;
        siteId: string | null;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    })[]>;
    create(dto: CreateWorkOrderDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
            taxId: string | null;
            phone: string | null;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
        } | null;
        quote: {
            number: string;
            id: string;
            currency: string;
            title: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                inventoryItemId: string | null;
                category: string;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                total: Prisma.Decimal;
                unit: string;
                description: string;
            }[];
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                model: string | null;
                brand: string | null;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        quoteId: string | null;
        title: string;
        siteId: string | null;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    }>;
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
            taxId: string | null;
            phone: string | null;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
        } | null;
        quote: {
            number: string;
            id: string;
            currency: string;
            title: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                inventoryItemId: string | null;
                category: string;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                total: Prisma.Decimal;
                unit: string;
                description: string;
            }[];
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                model: string | null;
                brand: string | null;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        quoteId: string | null;
        title: string;
        siteId: string | null;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    }>;
    addMaterial(id: string, dto: AddWorkOrderMaterialDto): Promise<({
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
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            model: string | null;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
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
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
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
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        installedDeviceId: string | null;
    }) | ({
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
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            model: string | null;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
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
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
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
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        installedDeviceId: string | null;
    })[]>;
    returnMaterial(id: string, dto: ReturnWorkOrderMaterialDto): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            model: string | null;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
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
            costPrice: Prisma.Decimal | null;
            taxAmount: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
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
        unitCost: Prisma.Decimal | null;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        installedDeviceId: string | null;
    }>;
    reconcileCosts(id: string): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            reference: string;
            taxId: string | null;
            phone: string | null;
            address: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
            logoUrl: string | null;
            sites: {
                id: string;
                name: string;
                address: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                traccarGeofenceId: number | null;
            }[];
        };
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            traccarGeofenceId: number | null;
        } | null;
        quote: {
            number: string;
            id: string;
            currency: string;
            title: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                inventoryItemId: string | null;
                category: string;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                total: Prisma.Decimal;
                unit: string;
                description: string;
            }[];
        } | null;
        inventoryMovements: ({
            installedDevice: {
                id: string;
                model: string | null;
                brand: string | null;
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
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        customerId: string;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        quoteId: string | null;
        title: string;
        siteId: string | null;
        scheduledAt: Date | null;
        completedAt: Date | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
    }>;
    private syncCompletedWorkOrderMaterialExpenses;
    private includeRelations;
    private ensureCustomer;
    private ensureSiteBelongsToCustomer;
    private ensureWorkOrderSite;
    private cleanOptional;
    private cleanNullable;
    private cleanReportType;
    private roundMoney;
}
export {};
