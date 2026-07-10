import { Prisma } from "@prisma/client";
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
    constructor(prisma: PrismaService);
    list(filters: PaymentFilters): Promise<({
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryItem: {
            id: string;
            reference: string;
            name: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        inventoryMovements: {
            id: string;
            quantity: number;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
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
        customerId: string;
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
        method: string | null;
        reference: string | null;
        notes: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(dto: CreatePaymentDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryItem: {
            id: string;
            reference: string;
            name: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        inventoryMovements: {
            id: string;
            quantity: number;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
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
        customerId: string;
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
        method: string | null;
        reference: string | null;
        notes: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryItem: {
            id: string;
            reference: string;
            name: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        inventoryMovements: {
            id: string;
            quantity: number;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
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
        customerId: string;
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
        method: string | null;
        reference: string | null;
        notes: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        quote: {
            number: string;
            id: string;
            title: string;
            total: Prisma.Decimal;
        } | null;
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
        } | null;
        vehicle: {
            id: string;
            name: string;
            plate: string | null;
        } | null;
        inventoryItem: {
            id: string;
            reference: string;
            name: string;
            sku: string | null;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        inventoryMovements: {
            id: string;
            quantity: number;
            currency: string | null;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
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
        customerId: string;
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
        method: string | null;
        reference: string | null;
        notes: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
