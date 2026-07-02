import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, QuoteItemType, QuoteStatus, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuoteDto, CreateQuoteItemDto } from "./dto/create-quote.dto";
import { UpdateQuoteDto } from "./dto/update-quote.dto";

type QuoteFilters = {
  search?: string;
  customerId?: string;
  status?: QuoteStatus | "ACCEPTED" | "PENDING";
  service?: ServiceType;
};

type QuoteTotals = {
  materialsSubtotal: number;
  laborSubtotal: number;
  expensesSubtotal: number;
  subtotal: number;
  discountAmount: number;
  taxableBase: number;
  tax: number;
  total: number;
  costTotal: number;
  estimatedProfit: number;
  estimatedMargin: number;
  items: Array<QuoteItemInput & { taxRate: number; unitCost: number; subtotal: number; taxAmount: number; total: number; sortOrder: number }>;
};

type QuoteItemInput = {
  priceBookItemId?: string;
  type: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate?: number;
  unitCost?: number;
};

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: QuoteFilters) {
    const where: Prisma.QuoteWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.service) {
      where.service = filters.service;
    }

    if (filters.status === "ACCEPTED" || filters.status === "APPROVED") {
      where.acceptedAt = { not: null };
    }

    if (filters.status === "PENDING") {
      where.acceptedAt = null;
    }

    if (filters.status && !["ACCEPTED", "PENDING"].includes(filters.status)) {
      where.status = filters.status as QuoteStatus;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { number: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    return this.prisma.quote.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: this.includeCustomer(),
    });
  }

  async create(dto: CreateQuoteDto) {
    await this.ensureCustomer(dto.customerId);
    if (dto.meetingId) {
      await this.ensureMeeting(dto.meetingId);
    }
    const totals = await this.calculateTotals(dto.customerId, dto.items ?? [], {
      subtotal: dto.subtotal,
      tax: dto.tax,
      discountPercent: dto.discountPercent,
      laborPoints: dto.laborPoints,
      refreshLaborItem: true,
    });

    return this.prisma.quote.create({
      data: {
        customerId: dto.customerId,
        meetingId: this.cleanOptional(dto.meetingId),
        number: dto.number?.trim() || (await this.nextNumber()),
        title: dto.title.trim(),
        service: (dto.service as ServiceType | undefined) ?? "OTHER",
        status: (dto.status as QuoteStatus | undefined) ?? "DRAFT",
        currency: dto.currency?.trim() || "UYU",
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        taxIncluded: dto.taxIncluded ?? false,
        discountPercent: dto.discountPercent ?? 0,
        profitMarginPercent: dto.profitMarginPercent ?? 0,
        laborPoints: dto.laborPoints ?? 0,
        materialsSubtotal: totals.materialsSubtotal,
        laborSubtotal: totals.laborSubtotal,
        expensesSubtotal: totals.expensesSubtotal,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxableBase: totals.taxableBase,
        tax: totals.tax,
        total: totals.total,
        costTotal: totals.costTotal,
        estimatedProfit: totals.estimatedProfit,
        estimatedMargin: totals.estimatedMargin,
        internalNotes: this.cleanOptional(dto.internalNotes),
        commercialTerms: this.cleanOptional(dto.commercialTerms),
        executionTime: this.cleanOptional(dto.executionTime),
        warranty: this.cleanOptional(dto.warranty),
        paymentTerms: this.cleanOptional(dto.paymentTerms),
        acceptedAt: dto.status === "APPROVED" ? new Date() : undefined,
        sentAt: dto.status === "SENT" ? new Date() : undefined,
        rejectedAt: dto.status === "REJECTED" ? new Date() : undefined,
        items: {
          create: totals.items.map((item) => this.toQuoteItemCreate(item)),
        },
        history: {
          create: {
            action: "CREATED",
            comment: "Presupuesto creado",
          },
        },
      },
      include: this.includeCustomer(),
    });
  }

  async update(id: string, dto: UpdateQuoteDto) {
    const current = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!current) {
      throw new NotFoundException("Quote not found");
    }

    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    if (dto.meetingId) {
      await this.ensureMeeting(dto.meetingId);
    }

    const itemsForCalculation =
      dto.items ??
      current.items.map((item) => ({
        priceBookItemId: item.priceBookItemId ?? undefined,
        type: item.type,
        category: item.category,
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        unitCost: Number(item.unitCost),
      }));
    const effectiveCustomerId = dto.customerId ?? current.customerId;
    const totals = await this.calculateTotals(effectiveCustomerId, itemsForCalculation, {
      subtotal: dto.subtotal === undefined ? Number(current.subtotal) : dto.subtotal,
      tax: dto.tax === undefined ? Number(current.tax) : dto.tax,
      discountPercent: dto.discountPercent === undefined ? Number(current.discountPercent) : dto.discountPercent,
      laborPoints: dto.laborPoints === undefined ? Number(current.laborPoints) : dto.laborPoints,
      refreshLaborItem: dto.laborPoints !== undefined || dto.customerId !== undefined,
    });
    const status = dto.acceptedAt ? "APPROVED" : (dto.status as QuoteStatus | undefined);
    const acceptedAt =
      dto.acceptedAt === ""
        ? null
        : dto.acceptedAt
          ? new Date(dto.acceptedAt)
          : dto.status === "APPROVED"
            ? new Date()
            : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.quoteItem.deleteMany({ where: { quoteId: id } });
      }

      return tx.quote.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          meetingId: dto.meetingId === "" ? null : this.cleanOptional(dto.meetingId),
          number: dto.number?.trim(),
          title: this.cleanOptional(dto.title),
          service: dto.service as ServiceType | undefined,
          status,
          currency: this.cleanOptional(dto.currency),
          issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
          validUntil: dto.validUntil === "" ? null : dto.validUntil ? new Date(dto.validUntil) : undefined,
          taxIncluded: dto.taxIncluded,
          discountPercent: dto.discountPercent,
          profitMarginPercent: dto.profitMarginPercent,
          laborPoints: dto.laborPoints,
          materialsSubtotal: totals.materialsSubtotal,
          laborSubtotal: totals.laborSubtotal,
          expensesSubtotal: totals.expensesSubtotal,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxableBase: totals.taxableBase,
          tax: totals.tax,
          total: totals.total,
          costTotal: totals.costTotal,
          estimatedProfit: totals.estimatedProfit,
          estimatedMargin: totals.estimatedMargin,
          internalNotes: this.cleanOptional(dto.internalNotes),
          commercialTerms: this.cleanOptional(dto.commercialTerms),
          executionTime: this.cleanOptional(dto.executionTime),
          warranty: this.cleanOptional(dto.warranty),
          paymentTerms: this.cleanOptional(dto.paymentTerms),
          sentAt: dto.status === "SENT" ? new Date() : undefined,
          acceptedAt,
          rejectedAt: dto.status === "REJECTED" ? new Date() : undefined,
          items: dto.items
            ? {
                create: totals.items.map((item) => this.toQuoteItemCreate(item)),
              }
            : undefined,
          history: {
            create: {
              action: status ? `STATUS_${status}` : "UPDATED",
              comment: status ? `Estado actualizado a ${status}` : "Presupuesto actualizado",
            },
          },
        },
        include: this.includeCustomer(),
      });
    });
  }

  private includeCustomer() {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      items: {
        orderBy: { sortOrder: "asc" },
      },
      history: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    } satisfies Prisma.QuoteInclude;
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async ensureMeeting(id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id }, select: { id: true } });
    if (!meeting) {
      throw new NotFoundException("Meeting not found");
    }
  }

  private async nextNumber() {
    const count = await this.prisma.quote.count();
    return `P-${String(count + 1).padStart(5, "0")}`;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }

  private async calculateTotals(
    customerId: string,
    items: QuoteItemInput[],
    fallback: { subtotal?: number; tax?: number; discountPercent?: number; laborPoints?: number; refreshLaborItem?: boolean },
  ): Promise<QuoteTotals> {
    const fallbackSubtotal = Number(fallback.subtotal) || 0;
    const baseItems =
      items.length || fallbackSubtotal <= 0
        ? items
        : [
            {
              type: "MATERIAL",
              category: "Materiales y equipos",
              description: "Materiales y equipos presupuestados",
              quantity: 1,
              unit: "global",
              unitPrice: fallbackSubtotal,
              taxRate: 22,
              unitCost: 0,
            },
          ];
    const pricedItems = await this.withAutomaticLaborItem(customerId, baseItems, fallback.laborPoints ?? 0, fallback.refreshLaborItem ?? false);
    const normalizedItems = pricedItems.map((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const taxRate = item.taxRate === undefined ? 22 : Number(item.taxRate);
      const subtotal = this.roundMoney(quantity * unitPrice);
      const taxAmount = this.roundMoney(subtotal * (taxRate / 100));
      return {
        ...item,
        taxRate,
        unitCost: Number(item.unitCost) || 0,
        subtotal,
        taxAmount,
        total: this.roundMoney(subtotal + taxAmount),
        sortOrder: index,
      };
    });

    const subtotal = normalizedItems.length
      ? this.roundMoney(normalizedItems.reduce((sum, item) => sum + item.subtotal, 0))
      : Number(fallback.subtotal ?? 0);
    const discountPercent = Number(fallback.discountPercent ?? 0);
    const discountAmount = this.roundMoney(subtotal * (discountPercent / 100));
    const taxableBase = this.roundMoney(Math.max(0, subtotal - discountAmount));
    const tax = normalizedItems.length
      ? this.roundMoney(normalizedItems.reduce((sum, item) => sum + item.taxAmount, 0) * (taxableBase / (subtotal || 1)))
      : Number(fallback.tax ?? this.roundMoney(taxableBase * 0.22));
    const total = this.roundMoney(taxableBase + tax);
    const costTotal = this.roundMoney(
      normalizedItems.reduce((sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0), 0),
    );
    const estimatedProfit = this.roundMoney(total - costTotal);
    const estimatedMargin = total > 0 ? this.roundMoney((estimatedProfit / total) * 100) : 0;

    return {
      materialsSubtotal: this.sumByType(normalizedItems, ["EQUIPMENT", "MATERIAL", "SUPPLY"]),
      laborSubtotal: this.sumByType(normalizedItems, ["LABOR"]),
      expensesSubtotal: this.sumByType(normalizedItems, ["EXPENSE"]),
      subtotal,
      discountAmount,
      taxableBase,
      tax,
      total,
      costTotal,
      estimatedProfit,
      estimatedMargin,
      items: normalizedItems,
    };
  }

  private async withAutomaticLaborItem(customerId: string, items: QuoteItemInput[], laborPoints: number, refreshLaborItem: boolean) {
    const points = Number(laborPoints) || 0;
    const withoutAutoLabor = refreshLaborItem ? items.filter((item) => !(item.type === "LABOR" && item.unit === "punta")) : items;
    const alreadyHasLaborPoints = withoutAutoLabor.some((item) => item.type === "LABOR" && item.unit === "punta");

    if (points <= 0 || alreadyHasLaborPoints) {
      return withoutAutoLabor;
    }

    const rate = await this.effectiveLaborPointRate(customerId);
    return [
      ...withoutAutoLabor,
      {
        type: "LABOR",
        category: "Mano de obra",
        description: rate.source === "CUSTOMER" ? `Mano de obra por puntas - ${rate.name}` : "Mano de obra por puntas",
        quantity: points,
        unit: "punta",
        unitPrice: rate.pointValue,
        taxRate: rate.taxRate,
        unitCost: rate.pointValue,
      },
    ];
  }

  private async effectiveLaborPointRate(customerId: string) {
    const customerRate = await this.prisma.customerLaborPointRate.findFirst({
      where: { customerId, active: true },
      orderBy: { updatedAt: "desc" },
    });

    if (customerRate) {
      return {
        source: "CUSTOMER" as const,
        name: customerRate.name,
        pointValue: Number(customerRate.pointValue),
        taxRate: Number(customerRate.taxRate),
      };
    }

    const defaultRate = await this.prisma.laborPointRate.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });
    if (!defaultRate) {
      throw new NotFoundException("Labor point rate not found");
    }

    return {
      source: "DEFAULT" as const,
      name: defaultRate.name,
      pointValue: Number(defaultRate.pointValue),
      taxRate: Number(defaultRate.taxRate),
    };
  }

  private sumByType(items: Array<{ type: string; subtotal: number }>, types: string[]) {
    return this.roundMoney(items.filter((item) => types.includes(item.type)).reduce((sum, item) => sum + item.subtotal, 0));
  }

  private toQuoteItemCreate(item: QuoteTotals["items"][number]): Prisma.QuoteItemCreateWithoutQuoteInput {
    return {
      priceBookItem: item.priceBookItemId ? { connect: { id: item.priceBookItemId } } : undefined,
      type: item.type as QuoteItemType,
      category: item.category.trim(),
      description: item.description.trim(),
      quantity: item.quantity,
      unit: item.unit.trim() || "u",
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      unitCost: item.unitCost ?? 0,
      subtotal: item.subtotal,
      taxAmount: item.taxAmount,
      total: item.total,
      sortOrder: item.sortOrder,
    };
  }
}
