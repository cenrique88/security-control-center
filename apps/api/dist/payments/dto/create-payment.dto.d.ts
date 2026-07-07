export declare class CreatePaymentDto {
    customerId: string;
    quoteId?: string;
    workOrderId?: string;
    vehicleId?: string;
    transactionType?: "INCOME" | "EXPENSE";
    category?: string;
    concept: string;
    amount: number;
    currency?: string;
    method?: string;
    reference?: string;
    notes?: string;
    dueDate?: string;
    paidAt?: string;
}
