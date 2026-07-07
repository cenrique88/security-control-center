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
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        service: import(".prisma/client").$Enums.ServiceType | null;
        currency: string;
        category: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
    }[]>;
    create(dto: UpsertPriceBookItemDto): import(".prisma/client").Prisma.Prisma__PriceBookItemClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        service: import(".prisma/client").$Enums.ServiceType | null;
        currency: string;
        category: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    laborRates(customerId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }[] | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        code: string;
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
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    })[]>;
    createCustomerLaborRate(dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }>;
    updateCustomerLaborRate(id: string, dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
            salePrice: import("@prisma/client/runtime/library").Decimal;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    })[]>;
    upsertCustomerPriceOverride(dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    }>;
    updateCustomerPriceOverride(id: string, dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        customerId: string;
        currency: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    }>;
    update(id: string, dto: UpsertPriceBookItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        service: import(".prisma/client").$Enums.ServiceType | null;
        currency: string;
        category: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        brand: string | null;
        model: string | null;
        description: string | null;
        code: string;
    }>;
}
