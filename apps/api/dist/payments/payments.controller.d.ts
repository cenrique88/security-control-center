import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(search?: string, customerId?: string, status?: "PAID" | "PENDING" | "OVERDUE"): Promise<({
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
}
