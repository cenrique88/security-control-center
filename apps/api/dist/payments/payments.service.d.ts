import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
type PaymentFilters = {
    search?: string;
    customerId?: string;
    status?: "PAID" | "PENDING" | "OVERDUE";
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
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        concept: string;
        amount: Prisma.Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
    })[]>;
    create(dto: CreatePaymentDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        concept: string;
        amount: Prisma.Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        concept: string;
        amount: Prisma.Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    private includeCustomer;
    private ensureCustomer;
    private cleanOptional;
}
export {};
