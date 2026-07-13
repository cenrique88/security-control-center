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
        customer: {
            id: string;
            name: string;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            phone: string | null;
        };
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
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            currency: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        method: string | null;
        customerId: string;
        notes: string | null;
        reference: string | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        category: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        currency: string;
        dueDate: Date | null;
        paidAt: Date | null;
    })[]>;
    create(dto: CreatePaymentDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            phone: string | null;
        };
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
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            currency: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        method: string | null;
        customerId: string;
        notes: string | null;
        reference: string | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        category: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        currency: string;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            phone: string | null;
        };
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
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            currency: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        method: string | null;
        customerId: string;
        notes: string | null;
        reference: string | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        category: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        currency: string;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    remove(id: string): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
            phone: string | null;
        };
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
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            currency: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        method: string | null;
        customerId: string;
        notes: string | null;
        reference: string | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        category: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        currency: string;
        dueDate: Date | null;
        paidAt: Date | null;
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
