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
            logoUrl: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            phone: string | null;
            reference: string;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            sites: {
                id: string;
                name: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                address: string;
                traccarGeofenceId: number | null;
            }[];
        };
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
        site: {
            id: string;
            name: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            address: string;
            traccarGeofenceId: number | null;
        } | null;
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
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                category: string;
                unit: string;
                total: Prisma.Decimal;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                inventoryItemId: string | null;
                description: string;
            }[];
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        customerId: string;
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
        quoteId: string | null;
    })[]>;
    create(dto: CreateWorkOrderDto): Promise<{
        customer: {
            id: string;
            name: string;
            logoUrl: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            phone: string | null;
            reference: string;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            sites: {
                id: string;
                name: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                address: string;
                traccarGeofenceId: number | null;
            }[];
        };
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
        site: {
            id: string;
            name: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            address: string;
            traccarGeofenceId: number | null;
        } | null;
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
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                category: string;
                unit: string;
                total: Prisma.Decimal;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                inventoryItemId: string | null;
                description: string;
            }[];
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        customerId: string;
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
        quoteId: string | null;
    }>;
    update(id: string, dto: UpdateWorkOrderDto): Promise<{
        customer: {
            id: string;
            name: string;
            logoUrl: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            phone: string | null;
            reference: string;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            sites: {
                id: string;
                name: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                address: string;
                traccarGeofenceId: number | null;
            }[];
        };
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
        site: {
            id: string;
            name: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            address: string;
            traccarGeofenceId: number | null;
        } | null;
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
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                category: string;
                unit: string;
                total: Prisma.Decimal;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                inventoryItemId: string | null;
                description: string;
            }[];
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        customerId: string;
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
        quoteId: string | null;
    }>;
    addMaterial(id: string, dto: AddWorkOrderMaterialDto): Promise<({
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
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
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
    }) | ({
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
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
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
    })[]>;
    returnMaterial(id: string, dto: ReturnWorkOrderMaterialDto): Promise<{
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
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ServiceType;
            notes: string | null;
            siteId: string;
            brand: string | null;
            serial: string | null;
            ipAddress: string | null;
            installedAt: Date | null;
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
    reconcileCosts(id: string): Promise<{
        customer: {
            id: string;
            name: string;
            logoUrl: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            phone: string | null;
            reference: string;
            taxId: string | null;
            email: string | null;
            address: string | null;
            traccarGeofenceId: number | null;
            sites: {
                id: string;
                name: string;
                latitude: Prisma.Decimal | null;
                longitude: Prisma.Decimal | null;
                address: string;
                traccarGeofenceId: number | null;
            }[];
        };
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
        site: {
            id: string;
            name: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            address: string;
            traccarGeofenceId: number | null;
        } | null;
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
                inventoryItem: {
                    id: string;
                    name: string;
                } | null;
                category: string;
                unit: string;
                total: Prisma.Decimal;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                inventoryItemId: string | null;
                description: string;
            }[];
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.WorkOrderStatus;
        type: import(".prisma/client").$Enums.ServiceType;
        notes: string | null;
        customerId: string;
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
        quoteId: string | null;
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
