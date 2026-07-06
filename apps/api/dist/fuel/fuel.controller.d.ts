import { FuelService } from "./fuel.service";
export declare class FuelController {
    private readonly fuelService;
    constructor(fuelService: FuelService);
    getUruguaySuper(): Promise<{
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
