import { Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class PriceBookService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: PriceBookFilters) {
    const where: Prisma.PriceBookItemWhereInput = {};

    if (filters.category && filters.category !== "ALL") {
      where.category = filters.category;
    }

    if (filters.service) {
      where.service = filters.service;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.active === "true") {
      where.active = true;
    }

    if (filters.active === "false") {
      where.active = false;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { code: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
      ];
    }

    return this.prisma.priceBookItem.findMany({
      where,
      orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
    });
  }

  create(dto: UpsertPriceBookItemDto) {
    return this.prisma.priceBookItem.create({
      data: this.cleanPriceBookPayload(dto),
    });
  }

  async update(id: string, dto: UpsertPriceBookItemDto) {
    await this.ensurePriceBookItem(id);
    return this.prisma.priceBookItem.update({
      where: { id },
      data: this.cleanPriceBookPayload(dto),
    });
  }

  async laborRates(customerId?: string) {
    if (customerId) {
      const customerRates = await this.prisma.customerLaborPointRate.findMany({
        where: { customerId },
        orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
      });

      if (customerRates.length) {
        return customerRates;
      }
    }

    return this.prisma.laborPointRate.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });
  }

  async updateLaborRate(id: string, dto: UpdateLaborPointRateDto) {
    const current = await this.prisma.laborPointRate.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Labor point rate not found");
    }

    return this.prisma.laborPointRate.update({
      where: { id },
      data: {
        name: this.cleanOptional(dto.name),
        pointValue: dto.pointValue,
        taxRate: dto.taxRate,
        currency: this.cleanOptional(dto.currency),
        active: dto.active,
        notes: this.cleanOptional(dto.notes),
      },
    });
  }

  async customerLaborRates(customerId?: string) {
    return this.prisma.customerLaborPointRate.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
      include: { customer: { select: { id: true, name: true } } },
    });
  }

  async createCustomerLaborRate(dto: UpsertCustomerLaborPointRateDto) {
    await this.ensureCustomer(dto.customerId);
    return this.prisma.customerLaborPointRate.create({
      data: {
        customerId: dto.customerId,
        name: dto.name.trim(),
        pointValue: dto.pointValue,
        taxRate: dto.taxRate ?? 22,
        currency: dto.currency?.trim() || "UYU",
        active: dto.active ?? true,
        notes: this.cleanOptional(dto.notes),
      },
    });
  }

  async updateCustomerLaborRate(id: string, dto: UpsertCustomerLaborPointRateDto) {
    const current = await this.prisma.customerLaborPointRate.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Customer labor point rate not found");
    }

    await this.ensureCustomer(dto.customerId);
    return this.prisma.customerLaborPointRate.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        name: dto.name.trim(),
        pointValue: dto.pointValue,
        taxRate: dto.taxRate ?? 22,
        currency: dto.currency?.trim() || "UYU",
        active: dto.active ?? true,
        notes: this.cleanOptional(dto.notes),
      },
    });
  }

  async customerPriceOverrides(customerId?: string) {
    return this.prisma.customerPriceOverride.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
      include: {
        customer: { select: { id: true, name: true } },
        priceBookItem: { select: { id: true, code: true, name: true, category: true, salePrice: true } },
      },
    });
  }

  async upsertCustomerPriceOverride(dto: UpsertCustomerPriceOverrideDto) {
    await this.ensureCustomer(dto.customerId);
    await this.ensurePriceBookItem(dto.priceBookItemId);

    return this.prisma.customerPriceOverride.upsert({
      where: { customerId_priceBookItemId: { customerId: dto.customerId, priceBookItemId: dto.priceBookItemId } },
      create: this.cleanCustomerPriceOverridePayload(dto),
      update: this.cleanCustomerPriceOverridePayload(dto),
    });
  }

  async updateCustomerPriceOverride(id: string, dto: UpsertCustomerPriceOverrideDto) {
    const current = await this.prisma.customerPriceOverride.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Customer price override not found");
    }

    await this.ensureCustomer(dto.customerId);
    await this.ensurePriceBookItem(dto.priceBookItemId);
    return this.prisma.customerPriceOverride.update({
      where: { id },
      data: this.cleanCustomerPriceOverridePayload(dto),
    });
  }

  async calculateLaborPoints(points: number, rateId?: string, customerId?: string) {
    const effectiveRate = await this.effectiveLaborPointRate(customerId, rateId);
    const subtotal = this.roundMoney(points * effectiveRate.pointValue);
    const tax = this.roundMoney(subtotal * (effectiveRate.taxRate / 100));
    return {
      points,
      rateId: effectiveRate.id,
      rateName: effectiveRate.name,
      source: effectiveRate.source,
      customerId: effectiveRate.customerId,
      pointValue: effectiveRate.pointValue,
      taxRate: effectiveRate.taxRate,
      subtotal,
      tax,
      total: this.roundMoney(subtotal + tax),
      currency: effectiveRate.currency,
    };
  }

  async effectiveLaborPointRate(customerId?: string, rateId?: string) {
    if (rateId) {
      const customerRate = await this.prisma.customerLaborPointRate.findUnique({ where: { id: rateId } });
      if (customerRate) {
        return {
          id: customerRate.id,
          name: customerRate.name,
          source: "CUSTOMER" as const,
          customerId: customerRate.customerId,
          pointValue: Number(customerRate.pointValue),
          taxRate: Number(customerRate.taxRate),
          currency: customerRate.currency,
        };
      }

      const defaultRate = await this.prisma.laborPointRate.findUnique({ where: { id: rateId } });
      if (defaultRate) {
        return {
          id: defaultRate.id,
          name: defaultRate.name,
          source: "DEFAULT" as const,
          customerId: undefined,
          pointValue: Number(defaultRate.pointValue),
          taxRate: Number(defaultRate.taxRate),
          currency: defaultRate.currency,
        };
      }
    }

    if (customerId) {
      const customerRate = await this.prisma.customerLaborPointRate.findFirst({
        where: { customerId, active: true },
        orderBy: { updatedAt: "desc" },
      });

      if (customerRate) {
        return {
          id: customerRate.id,
          name: customerRate.name,
          source: "CUSTOMER" as const,
          customerId: customerRate.customerId,
          pointValue: Number(customerRate.pointValue),
          taxRate: Number(customerRate.taxRate),
          currency: customerRate.currency,
        };
      }
    }

    const defaultRate = await this.prisma.laborPointRate.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });
    if (!defaultRate) {
      throw new NotFoundException("Labor point rate not found");
    }

    return {
      id: defaultRate.id,
      name: defaultRate.name,
      source: "DEFAULT" as const,
      customerId: undefined,
      pointValue: Number(defaultRate.pointValue),
      taxRate: Number(defaultRate.taxRate),
      currency: defaultRate.currency,
    };
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async ensurePriceBookItem(id: string) {
    const item = await this.prisma.priceBookItem.findUnique({ where: { id }, select: { id: true } });
    if (!item) {
      throw new NotFoundException("Price book item not found");
    }
  }

  private cleanPriceBookPayload(dto: UpsertPriceBookItemDto): Prisma.PriceBookItemUncheckedCreateInput {
    return {
      code: dto.code.trim(),
      name: dto.name.trim(),
      type: (dto.type as QuoteItemType | undefined) ?? "EQUIPMENT",
      category: dto.category.trim(),
      service: dto.service as ServiceType | undefined,
      brand: this.cleanOptional(dto.brand),
      model: this.cleanOptional(dto.model),
      description: this.cleanOptional(dto.description),
      unit: dto.unit?.trim() || "u",
      costPrice: dto.costPrice ?? 0,
      salePrice: dto.salePrice ?? 0,
      taxRate: dto.taxRate ?? 22,
      currency: dto.currency?.trim() || "UYU",
      active: dto.active ?? true,
    };
  }

  private cleanCustomerPriceOverridePayload(dto: UpsertCustomerPriceOverrideDto): Prisma.CustomerPriceOverrideUncheckedCreateInput {
    return {
      customerId: dto.customerId,
      priceBookItemId: dto.priceBookItemId,
      salePrice: dto.salePrice,
      costPrice: dto.costPrice ?? 0,
      taxRate: dto.taxRate ?? 22,
      currency: dto.currency?.trim() || "UYU",
      active: dto.active ?? true,
      notes: this.cleanOptional(dto.notes),
    };
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
