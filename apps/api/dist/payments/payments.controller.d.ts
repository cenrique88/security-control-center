import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(search?: string, customerId?: string, status?: "PAID" | "PENDING" | "OVERDUE", type?: "INCOME" | "EXPENSE", category?: string): Promise<({
        customer: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        notes: string | null;
        customerId: string;
        currency: string;
        transactionType: string;
        category: string;
        concept: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
    })[]>;
    create(dto: CreatePaymentDto): Promise<{
        customer: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        notes: string | null;
        customerId: string;
        currency: string;
        transactionType: string;
        category: string;
        concept: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        customer: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            type: import(".prisma/client").$Enums.CustomerType;
        };
        workOrder: {
            id: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            title: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reference: string | null;
        notes: string | null;
        customerId: string;
        currency: string;
        transactionType: string;
        category: string;
        concept: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
    }>;
}
