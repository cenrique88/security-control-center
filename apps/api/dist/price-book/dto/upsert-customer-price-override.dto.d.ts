export declare class UpsertCustomerPriceOverrideDto {
    customerId: string;
    priceBookItemId: string;
    salePrice: number;
    costPrice?: number;
    taxRate?: number;
    currency?: string;
    active?: boolean;
    notes?: string;
}
