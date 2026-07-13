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
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        model: string | null;
        active: boolean;
        category: string;
        currency: string;
        service: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        brand: string | null;
        description: string | null;
        code: string;
    }[]>;
    create(dto: UpsertPriceBookItemDto): import(".prisma/client").Prisma.Prisma__PriceBookItemClient<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        model: string | null;
        active: boolean;
        category: string;
        currency: string;
        service: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        brand: string | null;
        description: string | null;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    laborRates(customerId?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    }[] | {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        notes: string | null;
        active: boolean;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
        createdAt: Date;
        name: string;
        updatedAt: Date;
        notes: string | null;
        active: boolean;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        code: string;
    }>;
    customerLaborRates(customerId?: string): Promise<({
        customer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createCustomerLaborRate(dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
        pointValue: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateCustomerLaborRate(id: string, dto: UpsertCustomerLaborPointRateDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
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
            salePrice: import("@prisma/client/runtime/library").Decimal;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    })[]>;
    upsertCustomerPriceOverride(dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    }>;
    updateCustomerPriceOverride(id: string, dto: UpsertCustomerPriceOverrideDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        notes: string | null;
        active: boolean;
        currency: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        priceBookItemId: string;
    }>;
    update(id: string, dto: UpsertPriceBookItemDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.QuoteItemType;
        model: string | null;
        active: boolean;
        category: string;
        currency: string;
        service: import(".prisma/client").$Enums.ServiceType | null;
        unit: string;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        salePrice: import("@prisma/client/runtime/library").Decimal;
        brand: string | null;
        description: string | null;
        code: string;
    }>;
}
