import { Prisma, QuoteItemType, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateLaborPointRateDto } from "./dto/update-labor-point-rate.dto";
import { UpsertCustomerLaborPointRateDto } from "./dto/upsert-customer-labor-point-rate.dto";
import { UpsertCustomerPriceOverrideDto } from "./dto/upsert-customer-price-override.dto";
import { UpsertPriceBookItemDto } from "./dto/upsert-price-book-item.dto";
type PriceBookFilters = {
    search?: string;
    category?: string;
    service?: ServiceType;
    type?: QuoteItemType;
    active?: string;
};
export declare class PriceBookService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters: PriceBookFilters): Prisma.PrismaPromise<{
        id: string;
        name: string;
        category: string;
        unit: string;
        costPrice: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
        active: boolean;
        service: import(".prisma/client").$Enums.ServiceType | null;
        taxRate: Prisma.Decimal;
        salePrice: Prisma.Decimal;
    }[]>;
    create(dto: UpsertPriceBookItemDto): Prisma.Prisma__PriceBookItemClient<{
        id: string;
        name: string;
        category: string;
        unit: string;
        costPrice: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
        active: boolean;
        service: import(".prisma/client").$Enums.ServiceType | null;
        taxRate: Prisma.Decimal;
        salePrice: Prisma.Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, dto: UpsertPriceBookItemDto): Promise<{
        id: string;
        name: string;
        category: string;
        unit: string;
        costPrice: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
        active: boolean;
        service: import(".prisma/client").$Enums.ServiceType | null;
        taxRate: Prisma.Decimal;
        salePrice: Prisma.Decimal;
    }>;
    laborRates(customerId?: string): Promise<{
        id: string;
        name: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
    }[] | {
        id: string;
        name: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        active: boolean;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
    }[]>;
    updateLaborRate(id: string, dto: UpdateLaborPointRateDto): Promise<{
        id: string;
        name: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        active: boolean;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
    }>;
    customerLaborRates(customerId?: string): Promise<({
        customer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
    })[]>;
    createCustomerLaborRate(dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        name: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
    }>;
    updateCustomerLaborRate(id: string, dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        name: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
    }>;
    customerPriceOverrides(customerId?: string): Promise<({
        customer: {
            id: string;
            name: string;
        };
        priceBookItem: {
            id: string;
            name: string;
            category: string;
            code: string;
            salePrice: Prisma.Decimal;
        };
    } & {
        id: string;
        customerId: string;
        costPrice: Prisma.Decimal;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        taxRate: Prisma.Decimal;
        salePrice: Prisma.Decimal;
        priceBookItemId: string;
    })[]>;
    upsertCustomerPriceOverride(dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        customerId: string;
        costPrice: Prisma.Decimal;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        taxRate: Prisma.Decimal;
        salePrice: Prisma.Decimal;
        priceBookItemId: string;
    }>;
    updateCustomerPriceOverride(id: string, dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        customerId: string;
        costPrice: Prisma.Decimal;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        taxRate: Prisma.Decimal;
        salePrice: Prisma.Decimal;
        priceBookItemId: string;
    }>;
    calculateLaborPoints(points: number, rateId?: string, customerId?: string): Promise<{
        points: number;
        rateId: string;
        rateName: string;
        source: "CUSTOMER" | "DEFAULT";
        customerId: string | undefined;
        pointValue: number;
        taxRate: number;
        subtotal: number;
        tax: number;
        total: number;
        currency: string;
    }>;
    effectiveLaborPointRate(customerId?: string, rateId?: string): Promise<{
        id: string;
        name: string;
        source: "CUSTOMER";
        customerId: string;
        pointValue: number;
        taxRate: number;
        currency: string;
    } | {
        id: string;
        name: string;
        source: "DEFAULT";
        customerId: undefined;
        pointValue: number;
        taxRate: number;
        currency: string;
    }>;
    private ensureCustomer;
    private ensurePriceBookItem;
    private cleanPriceBookPayload;
    private cleanCustomerPriceOverridePayload;
    private cleanOptional;
    private roundMoney;
}
export {};
