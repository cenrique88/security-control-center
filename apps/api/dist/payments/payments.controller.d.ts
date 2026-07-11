import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(search?: string, customerId?: string, status?: "PAID" | "PENDING" | "OVERDUE", type?: "INCOME" | "EXPENSE", category?: string, period?: "CURRENT_MONTH", includeInternalCosts?: string): Promise<({
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
            total: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        quantity: number | null;
        unitPrice: import("@prisma/client/runtime/library").Decimal | null;
        dueDate: Date | null;
        paidAt: Date | null;
        inventoryItemId: string | null;
    }>;
}
