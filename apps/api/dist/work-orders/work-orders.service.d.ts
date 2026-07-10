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
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
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
        quote: {
            number: string;
            id: string;
            title: string;
            currency: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                total: Prisma.Decimal;
                inventoryItemId: string | null;
                category: string;
                description: string;
                quantity: Prisma.Decimal;
                unit: string;
                unitPrice: Prisma.Decimal;
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
            }[];
        } | null;
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                name: string;
                unit: string;
                sku: string | null;
            };
        } & {
            id: string;
            customerId: string | null;
            quoteId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            createdAt: Date;
            currency: string | null;
            quantity: number;
            unitCost: Prisma.Decimal | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            workOrderId: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        quoteId: string | null;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
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
        quote: {
            number: string;
            id: string;
            title: string;
            currency: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                total: Prisma.Decimal;
                inventoryItemId: string | null;
                category: string;
                description: string;
                quantity: Prisma.Decimal;
                unit: string;
                unitPrice: Prisma.Decimal;
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
            }[];
        } | null;
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                name: string;
                unit: string;
                sku: string | null;
            };
        } & {
            id: string;
            customerId: string | null;
            quoteId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            createdAt: Date;
            currency: string | null;
            quantity: number;
            unitCost: Prisma.Decimal | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            workOrderId: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        quoteId: string | null;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
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
        quote: {
            number: string;
            id: string;
            title: string;
            currency: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                total: Prisma.Decimal;
                inventoryItemId: string | null;
                category: string;
                description: string;
                quantity: Prisma.Decimal;
                unit: string;
                unitPrice: Prisma.Decimal;
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
            }[];
        } | null;
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                name: string;
                unit: string;
                sku: string | null;
            };
        } & {
            id: string;
            customerId: string | null;
            quoteId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            createdAt: Date;
            currency: string | null;
            quantity: number;
            unitCost: Prisma.Decimal | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            workOrderId: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        quoteId: string | null;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addMaterial(id: string, dto: AddWorkOrderMaterialDto): Promise<({
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
            siteId: string;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            brand: string | null;
            model: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
        } | null;
        item: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            name: string;
            currency: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            taxAmount: Prisma.Decimal | null;
            sku: string | null;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
        };
    } & {
        id: string;
        customerId: string | null;
        quoteId: string | null;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        createdAt: Date;
        currency: string | null;
        quantity: number;
        unitCost: Prisma.Decimal | null;
        sourceType: string | null;
        itemId: string;
        paymentId: string | null;
        stockAfter: number;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        workOrderId: string | null;
        installedDeviceId: string | null;
    }) | ({
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
            siteId: string;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            brand: string | null;
            model: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
        } | null;
        item: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            name: string;
            currency: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            taxAmount: Prisma.Decimal | null;
            sku: string | null;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
        };
    } & {
        id: string;
        customerId: string | null;
        quoteId: string | null;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        createdAt: Date;
        currency: string | null;
        quantity: number;
        unitCost: Prisma.Decimal | null;
        sourceType: string | null;
        itemId: string;
        paymentId: string | null;
        stockAfter: number;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        workOrderId: string | null;
        installedDeviceId: string | null;
    })[]>;
    returnMaterial(id: string, dto: ReturnWorkOrderMaterialDto): Promise<{
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
            siteId: string;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            brand: string | null;
            model: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
        } | null;
        item: {
            id: string;
            customerId: string | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            reference: string;
            name: string;
            currency: string | null;
            category: import(".prisma/client").$Enums.ServiceType | null;
            unit: string;
            taxAmount: Prisma.Decimal | null;
            sku: string | null;
            stock: number;
            minStock: number;
            managedStock: boolean;
            sourceType: string;
            location: string | null;
            supplier: string | null;
            supplierCategory: string | null;
            costPrice: Prisma.Decimal | null;
            priceWithTax: Prisma.Decimal | null;
        };
    } & {
        id: string;
        customerId: string | null;
        quoteId: string | null;
        type: import(".prisma/client").$Enums.InventoryMovementType;
        createdAt: Date;
        currency: string | null;
        quantity: number;
        unitCost: Prisma.Decimal | null;
        sourceType: string | null;
        itemId: string;
        paymentId: string | null;
        stockAfter: number;
        totalCost: Prisma.Decimal | null;
        reason: string | null;
        workOrderId: string | null;
        installedDeviceId: string | null;
    }>;
    reconcileCosts(id: string): Promise<{
        customer: {
            id: string;
            reference: string;
            name: string;
            taxId: string | null;
            email: string | null;
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
        quote: {
            number: string;
            id: string;
            title: string;
            currency: string;
            total: Prisma.Decimal;
            commercialTerms: string | null;
            executionTime: string | null;
            warranty: string | null;
            paymentTerms: string | null;
            items: {
                id: string;
                type: import(".prisma/client").$Enums.QuoteItemType;
                total: Prisma.Decimal;
                inventoryItemId: string | null;
                category: string;
                description: string;
                quantity: Prisma.Decimal;
                unit: string;
                unitPrice: Prisma.Decimal;
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
            }[];
        } | null;
        site: {
            id: string;
            name: string;
            address: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
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
                name: string;
                unit: string;
                sku: string | null;
            };
        } & {
            id: string;
            customerId: string | null;
            quoteId: string | null;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            createdAt: Date;
            currency: string | null;
            quantity: number;
            unitCost: Prisma.Decimal | null;
            sourceType: string | null;
            itemId: string;
            paymentId: string | null;
            stockAfter: number;
            totalCost: Prisma.Decimal | null;
            reason: string | null;
            workOrderId: string | null;
            installedDeviceId: string | null;
        })[];
    } & {
        id: string;
        customerId: string;
        quoteId: string | null;
        siteId: string | null;
        title: string;
        type: import(".prisma/client").$Enums.ServiceType;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        scheduledAt: Date | null;
        completedAt: Date | null;
        notes: string | null;
        reportType: string | null;
        reportBeforeNotes: string | null;
        reportAfterNotes: string | null;
        reportTasks: string | null;
        reportTests: string | null;
        reportRecommendations: string | null;
        reportPhotos: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
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
