declare enum InventoryMovementTypeDto {
    IN = "IN",
    OUT = "OUT",
    ADJUST = "ADJUST"
}
export declare class CreateInventoryMovementDto {
    itemId: string;
    type: InventoryMovementTypeDto;
    quantity: number;
    unitCost?: number;
    currency?: string;
    createExpense?: boolean;
    zeroCostRecovery?: boolean;
    paymentCategory?: string;
    paymentMethod?: string;
    paymentReference?: string;
    sourceType?: string;
    customerId?: string;
    reason?: string;
    workOrderId?: string;
    installedDeviceId?: string;
}
export declare class CreateInventoryMovementBatchDto {
    items: CreateInventoryMovementDto[];
    type: InventoryMovementTypeDto;
    createExpense?: boolean;
    zeroCostRecovery?: boolean;
    paymentCategory?: string;
    paymentMethod?: string;
    paymentReference?: string;
    sourceType?: string;
    customerId?: string;
    reason?: string;
    workOrderId?: string;
    installedDeviceId?: string;
    currency?: string;
}
export {};
