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
            total: Prisma.Decimal;
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
        amount: Prisma.Decimal;
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
            total: Prisma.Decimal;
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
        amount: Prisma.Decimal;
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
            total: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        method: string | null;
        dueDate: Date | null;
        paidAt: Date | null;
        quoteId: string | null;
        workOrderId: string | null;
        vehicleId: string | null;
    }>;
    private includeCustomer;
    private ensureCustomer;
    private ensureOptionalLinks;
    private cleanOptional;
    private cleanNullable;
}
export {};
