import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(search?: string, customerId?: string, status?: "PAID" | "PENDING" | "OVERDUE", type?: "INCOME" | "EXPENSE", category?: string, period?: "CURRENT_MONTH", includeInternalCosts?: string): Promise<({
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
}
