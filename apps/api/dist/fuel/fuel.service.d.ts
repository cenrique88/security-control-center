export declare class FuelService {
    getUruguaySuperPrice(): Promise<{
        product: string;
        country: string;
        currency: string;
        pricePerLiter: number;
        source: string;
        updatedAt: string;
        fallback?: undefined;
    } | {
        product: string;
        country: string;
        currency: string;
        pricePerLiter: number;
        source: string;
        updatedAt: string;
        fallback: boolean;
    }>;
}
