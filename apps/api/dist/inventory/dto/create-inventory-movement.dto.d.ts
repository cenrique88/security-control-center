declare enum InventoryMovementTypeDto {
    IN = "IN",
    OUT = "OUT",
    ADJUST = "ADJUST"
}
export declare class CreateInventoryMovementDto {
    itemId: string;
    type: InventoryMovementTypeDto;
    quantity: number;
    reason?: string;
    workOrderId?: string;
    installedDeviceId?: string;
}
export {};
