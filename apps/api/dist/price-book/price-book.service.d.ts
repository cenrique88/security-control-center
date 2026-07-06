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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        unit: string;
        costPrice: Prisma.Decimal;
        currency: string;
        type: import(".prisma/client").$Enums.QuoteItemType;
        service: import(".prisma/client").$Enums.ServiceType | null;
        taxRate: Prisma.Decimal;
        active: boolean;
        salePrice: Prisma.Decimal;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
    }[]>;
    create(dto: UpsertPriceBookItemDto): Prisma.Prisma__PriceBookItemClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        unit: string;
        costPrice: Prisma.Decimal;
        currency: string;
        type: import(".prisma/client").$Enums.QuoteItemType;
        service: import(".prisma/client").$Enums.ServiceType | null;
        taxRate: Prisma.Decimal;
        active: boolean;
        salePrice: Prisma.Decimal;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, dto: UpsertPriceBookItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        unit: string;
        costPrice: Prisma.Decimal;
        currency: string;
        type: import(".prisma/client").$Enums.QuoteItemType;
        service: import(".prisma/client").$Enums.ServiceType | null;
        taxRate: Prisma.Decimal;
        active: boolean;
        salePrice: Prisma.Decimal;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
    }>;
    laborRates(customerId?: string): Promise<{
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        currency: string;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        active: boolean;
    }[] | {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        currency: string;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        active: boolean;
        code: string;
    }[]>;
    updateLaborRate(id: string, dto: UpdateLaborPointRateDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        currency: string;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        active: boolean;
        code: string;
    }>;
    customerLaborRates(customerId?: string): Promise<({
        customer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        currency: string;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        active: boolean;
    })[]>;
    createCustomerLaborRate(dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        currency: string;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        active: boolean;
    }>;
    updateCustomerLaborRate(id: string, dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        currency: string;
        pointValue: Prisma.Decimal;
        taxRate: Prisma.Decimal;
        active: boolean;
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
            salePrice: Prisma.Decimal;
            code: string;
        };
    } & {
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        costPrice: Prisma.Decimal;
        currency: string;
        taxRate: Prisma.Decimal;
        active: boolean;
        salePrice: Prisma.Decimal;
        priceBookItemId: string;
    })[]>;
    upsertCustomerPriceOverride(dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        costPrice: Prisma.Decimal;
        currency: string;
        taxRate: Prisma.Decimal;
        active: boolean;
        salePrice: Prisma.Decimal;
        priceBookItemId: string;
    }>;
    updateCustomerPriceOverride(id: string, dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        customerId: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        costPrice: Prisma.Decimal;
        currency: string;
        taxRate: Prisma.Decimal;
        active: boolean;
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
