import { Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
type PaymentFilters = {
    search?: string;
    customerId?: string;
    status?: "PAID" | "PENDING" | "OVERDUE";
    type?: "INCOME" | "EXPENSE";
    category?: string;
    period?: "CURRENT_MONTH";
    includeInternalCosts?: boolean;
};
export declare class PaymentsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(filters: PaymentFilters): Promise<({
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        customer: {
            id: string;
            name: string;
            phone: string | null;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            currency: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        }[];
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        inventoryItem: {
            id: string;
            name: string;
            reference: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        reference: string | null;
        notes: string | null;
        customerId: string;
        method: string | null;
        workOrderId: string | null;
        category: string;
        currency: string;
        quoteId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        dueDate: Date | null;
        paidAt: Date | null;
        inventoryItemId: string | null;
    })[]>;
    create(dto: CreatePaymentDto): Promise<{
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        customer: {
            id: string;
            name: string;
            phone: string | null;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            currency: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        }[];
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        inventoryItem: {
            id: string;
            name: string;
            reference: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        reference: string | null;
        notes: string | null;
        customerId: string;
        method: string | null;
        workOrderId: string | null;
        category: string;
        currency: string;
        quoteId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        dueDate: Date | null;
        paidAt: Date | null;
        inventoryItemId: string | null;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        customer: {
            id: string;
            name: string;
            phone: string | null;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            currency: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        }[];
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        inventoryItem: {
            id: string;
            name: string;
            reference: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        reference: string | null;
        notes: string | null;
        customerId: string;
        method: string | null;
        workOrderId: string | null;
        category: string;
        currency: string;
        quoteId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        dueDate: Date | null;
        paidAt: Date | null;
        inventoryItemId: string | null;
    }>;
    remove(id: string): Promise<{
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        customer: {
            id: string;
            name: string;
            phone: string | null;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            currency: string | null;
            quantity: number;
            stockAfter: number;
            unitCost: Prisma.Decimal | null;
            totalCost: Prisma.Decimal | null;
            item: {
                id: string;
                name: string;
                sku: string | null;
                unit: string;
            };
        }[];
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        inventoryItem: {
            id: string;
            name: string;
            reference: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vehicleId: string | null;
        reference: string | null;
        notes: string | null;
        customerId: string;
        method: string | null;
        workOrderId: string | null;
        category: string;
        currency: string;
        quoteId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        dueDate: Date | null;
        paidAt: Date | null;
        inventoryItemId: string | null;
    }>;
    private includeCustomer;
    private ensureCustomer;
    private ensureOptionalLinks;
    private cleanOptional;
    private cleanNullable;
    private findInventoryItem;
    private findOrCreateInventoryItem;
    private nextInventoryReference;
    private sourceTypeFromCategory;
}
export {};
