import { QuoteItemType, ServiceType } from "@prisma/client";
import { UpdateLaborPointRateDto } from "./dto/update-labor-point-rate.dto";
import { UpsertCustomerLaborPointRateDto } from "./dto/upsert-customer-labor-point-rate.dto";
import { UpsertCustomerPriceOverrideDto } from "./dto/upsert-customer-price-override.dto";
import { UpsertPriceBookItemDto } from "./dto/upsert-price-book-item.dto";
import { PriceBookService } from "./price-book.service";
export declare class PriceBookController {
    private readonly priceBookService;
    constructor(priceBookService: PriceBookService);
    list(search?: string, category?: string, service?: ServiceType, type?: QuoteItemType, active?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        category: string;
        unit: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
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
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    create(dto: UpsertPriceBookItemDto): import(".prisma/client").Prisma.Prisma__PriceBookItemClient<{
        id: string;
        name: string;
        category: string;
        unit: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
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
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    laborRates(customerId?: string): Promise<{
        id: string;
        name: string;
        customerId: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    }[] | {
        id: string;
        name: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        active: boolean;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    calculateLaborPoints(points?: string, rateId?: string, customerId?: string): Promise<{
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
    updateLaborRate(id: string, dto: UpdateLaborPointRateDto): Promise<{
        id: string;
        name: string;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        active: boolean;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
            salePrice: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        customerId: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    })[]>;
    upsertCustomerPriceOverride(dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        customerId: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    }>;
    updateCustomerPriceOverride(id: string, dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        customerId: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    }>;
    update(id: string, dto: UpsertPriceBookItemDto): Promise<{
        id: string;
        name: string;
        category: string;
        unit: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
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
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
    }>;
}
