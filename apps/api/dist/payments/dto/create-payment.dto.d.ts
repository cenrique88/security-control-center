export declare class CreatePaymentDto {
    customerId: string;
    quoteId?: string;
    workOrderId?: string;
    vehicleId?: string;
    inventoryItemId?: string;
    inventoryItemName?: string;
    inventorySku?: string;
    inventorySourceType?: string;
    inventoryUnit?: string;
    createInventoryEntry?: boolean;
    transactionType?: "INCOME" | "EXPENSE";
    category?: string;
    concept: string;
    amount: number;
    quantity?: number;
    unitPrice?: number;
    currency?: string;
    method?: string;
    reference?: string;
    notes?: string;
    dueDate?: string;
    paidAt?: string;
}
