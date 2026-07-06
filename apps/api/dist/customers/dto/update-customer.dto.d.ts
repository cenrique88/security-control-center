declare enum CustomerStatusDto {
    ACTIVE = "ACTIVE",
    PROSPECT = "PROSPECT",
    INACTIVE = "INACTIVE"
}
declare enum CustomerTypeDto {
    NORMAL = "NORMAL",
    THIRD_PARTY = "THIRD_PARTY"
}
export declare class UpdateCustomerDto {
    name?: string;
    legalName?: string;
    taxId?: string;
    email?: string;
    phone?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    logoUrl?: string;
    type?: CustomerTypeDto;
    status?: CustomerStatusDto;
    notes?: string;
}
export {};
