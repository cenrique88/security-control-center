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
};
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: PaymentFilters): Promise<({
        inventoryItem: {
            id: string;
            reference: string;
            sku: string | null;
            name: string;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        customer: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
            email: string | null;
            phone: string | null;
        };
        workOrder: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            stockAfter: number;
        }[];
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
    } & {
        id: string;
        reference: string | null;
        category: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        method: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
    })[]>;
    create(dto: CreatePaymentDto): Promise<{
        inventoryItem: {
            id: string;
            reference: string;
            sku: string | null;
            name: string;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        customer: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
            email: string | null;
            phone: string | null;
        };
        workOrder: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            stockAfter: number;
        }[];
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
    } & {
        id: string;
        reference: string | null;
        category: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        method: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        inventoryItem: {
            id: string;
            reference: string;
            sku: string | null;
            name: string;
            unit: string;
            stock: number;
            sourceType: string;
        } | null;
        customer: {
            id: string;
            name: string;
            type: import(".prisma/client").$Enums.CustomerType;
            email: string | null;
            phone: string | null;
        };
        workOrder: {
            id: string;
            title: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
        } | null;
        inventoryMovements: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            stockAfter: number;
        }[];
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
    } & {
        id: string;
        reference: string | null;
        category: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
        inventoryItemId: string | null;
        transactionType: string;
        concept: string;
        amount: Prisma.Decimal;
        quantity: number | null;
        unitPrice: Prisma.Decimal | null;
        method: string | null;
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
