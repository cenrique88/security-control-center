export declare class UpdatePaymentDto {
    customerId?: string;
    quoteId?: string;
    workOrderId?: string;
    vehicleId?: string;
    inventoryItemId?: string;
    transactionType?: "INCOME" | "EXPENSE";
    category?: string;
    concept?: string;
    amount?: number;
    quantity?: number;
    unitPrice?: number;
    currency?: string;
    method?: string;
    reference?: string;
    notes?: string;
    dueDate?: string;
    paidAt?: string;
}
