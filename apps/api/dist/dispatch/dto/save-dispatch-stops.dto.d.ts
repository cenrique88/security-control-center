export declare enum DispatchPlaceTypeDto {
    CLIENT = "CLIENT",
    FUTURE_CLIENT = "FUTURE_CLIENT",
    IMPORTER = "IMPORTER",
    WAREHOUSE = "WAREHOUSE",
    LUNCH = "LUNCH",
    TRANSFER = "TRANSFER",
    OTHER = "OTHER"
}
export declare class SaveDispatchStopDto {
    stopKey: string;
    placeType?: DispatchPlaceTypeDto;
    title: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    customerId?: string;
    siteId?: string;
    workOrderId?: string;
    supplierName?: string;
    futureClientName?: string;
    kind?: string;
    zone?: string;
    scheduledAt?: string;
    durationMinutes?: number;
    parkingCost?: number;
    tollCost?: number;
    notes?: string;
    source?: string;
}
export declare class SaveDispatchStopsDto {
    date: string;
    vehicleId?: string;
    stops: SaveDispatchStopDto[];
}
