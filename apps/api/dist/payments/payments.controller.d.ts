import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(search?: string, customerId?: string, status?: "PAID" | "PENDING" | "OVERDUE", type?: "INCOME" | "EXPENSE", category?: string): Promise<({
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            stockAfter: number;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            stockAfter: number;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            stockAfter: number;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            createdAt: Date;
            type: import(".prisma/client").$Enums.InventoryMovementType;
            stockAfter: number;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        method: string | null;
        reference: string | null;
        notes: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
