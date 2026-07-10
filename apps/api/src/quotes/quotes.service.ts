import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, QuoteItemType, QuotePricingMode, QuoteStatus, ServiceType } from "@prisma/client";
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
  inventoryItemId?: string;
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
    const taxEnabled = dto.taxIncluded ?? true;
    const totals = await this.calculateTotals(dto.customerId, dto.items ?? [], {
      subtotal: dto.subtotal,
      tax: dto.tax,
      taxEnabled,
      discountPercent: dto.discountPercent,
      discountAmount: dto.discountAmount,
      laborPoints: dto.laborPoints,
      pricingMode: (dto.pricingMode as QuotePricingMode | undefined) ?? "DIRECT",
      refreshLaborItem: true,
    });

    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          customerId: dto.customerId,
          meetingId: this.cleanOptional(dto.meetingId),
          number: dto.number?.trim() || (await this.nextNumber()),
          title: dto.title.trim(),
          service: (dto.service as ServiceType | undefined) ?? "OTHER",
          status: (dto.status as QuoteStatus | undefined) ?? "DRAFT",
          pricingMode: (dto.pricingMode as QuotePricingMode | undefined) ?? "DIRECT",
          currency: dto.currency?.trim() || "UYU",
          issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          taxIncluded: taxEnabled,
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

      if (quote.status === "APPROVED") {
        await this.syncApprovedQuoteToWorkOrder(tx, quote.id);
      }

      return quote;
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
        inventoryItemId: item.inventoryItemId ?? undefined,
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
    const pricingMode = (dto.pricingMode as QuotePricingMode | undefined) ?? current.pricingMode;
    const taxEnabled = dto.taxIncluded ?? current.taxIncluded;
    const totals = await this.calculateTotals(effectiveCustomerId, itemsForCalculation, {
      subtotal: dto.subtotal === undefined ? Number(current.subtotal) : dto.subtotal,
      tax: dto.tax === undefined ? Number(current.tax) : dto.tax,
      taxEnabled,
      discountPercent: dto.discountPercent === undefined ? Number(current.discountPercent) : dto.discountPercent,
      discountAmount: dto.discountAmount === undefined ? Number(current.discountAmount) : dto.discountAmount,
      laborPoints: dto.laborPoints === undefined ? Number(current.laborPoints) : dto.laborPoints,
      pricingMode,
      refreshLaborItem: dto.laborPoints !== undefined || dto.customerId !== undefined || dto.pricingMode !== undefined,
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

      const quote = await tx.quote.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          meetingId: dto.meetingId === "" ? null : this.cleanOptional(dto.meetingId),
          number: dto.number?.trim(),
          title: this.cleanOptional(dto.title),
          service: dto.service as ServiceType | undefined,
          status,
          pricingMode: dto.pricingMode as QuotePricingMode | undefined,
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

      if (quote.status === "APPROVED" && (current.status !== "APPROVED" || dto.items || dto.scheduledAt)) {
        await this.syncApprovedQuoteToWorkOrder(tx, quote.id, dto.scheduledAt);
      }

      return quote;
    });
  }

  async remove(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { quoteId: id },
        data: { quoteId: null },
      });

      return tx.quote.delete({
        where: { id },
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
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              sku: true,
              supplier: true,
              currency: true,
              costPrice: true,
              priceWithTax: true,
              sourceType: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
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
    fallback: {
      subtotal?: number;
      tax?: number;
      taxEnabled?: boolean;
      discountPercent?: number;
      discountAmount?: number;
      laborPoints?: number;
      pricingMode?: QuotePricingMode;
      refreshLaborItem?: boolean;
    },
  ): Promise<QuoteTotals> {
    const fallbackSubtotal = Number(fallback.subtotal) || 0;
    const pricingMode = fallback.pricingMode ?? "DIRECT";
    const taxEnabled = fallback.taxEnabled ?? true;
    const shouldUseFallbackSubtotal = pricingMode === "MANUAL" || !items.length;
    const baseItems =
      items.length || fallbackSubtotal <= 0 || !shouldUseFallbackSubtotal
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
    const pricedItems =
      pricingMode === "THIRD_PARTY"
        ? await this.withAutomaticLaborItem(customerId, baseItems, fallback.laborPoints ?? 0, fallback.refreshLaborItem ?? false)
        : baseItems.filter((item) => !(item.type === "LABOR" && item.unit === "punta"));
    const normalizedItems = pricedItems.map((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const taxRate = taxEnabled ? 22 : 0;
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
    const fallbackDiscountAmount = Number(fallback.discountAmount);
    const discountAmount = this.roundMoney(
      Math.min(
        subtotal,
        Math.max(0, Number.isFinite(fallbackDiscountAmount) ? fallbackDiscountAmount : subtotal * (discountPercent / 100)),
      ),
    );
    const taxableBase = this.roundMoney(Math.max(0, subtotal - discountAmount));
    const tax = normalizedItems.length
      ? this.roundMoney(normalizedItems.reduce((sum, item) => sum + item.taxAmount, 0) * (taxableBase / (subtotal || 1)))
      : taxEnabled
        ? Number(fallback.tax ?? this.roundMoney(taxableBase * 0.22))
        : 0;
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
      inventoryItem: item.inventoryItemId ? { connect: { id: item.inventoryItemId } } : undefined,
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

  private async syncApprovedQuoteToWorkOrder(tx: Prisma.TransactionClient, quoteId: string, scheduledAt?: string) {
    const quote = await tx.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: true,
        workOrder: { select: { id: true } },
      },
    });

    if (!quote) {
      throw new NotFoundException("Quote not found");
    }

    let workOrder = quote.workOrder;
    if (!workOrder) {
      workOrder = await tx.workOrder.findFirst({
        where: {
          quoteId: null,
          customerId: quote.customerId,
          title: { equals: quote.title, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (workOrder) {
        await tx.workOrder.update({
          where: { id: workOrder.id },
          data: { quoteId: quote.id, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined },
        });
      }
    }

    if (!workOrder) {
      workOrder = await tx.workOrder.create({
        data: {
          quoteId: quote.id,
          customerId: quote.customerId,
          title: quote.title,
          type: quote.service,
          status: "SCHEDULED",
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          notes: [`Generada automaticamente al aprobar presupuesto ${quote.number}.`, quote.internalNotes].filter(Boolean).join("\n\n"),
        },
        select: { id: true },
      });
    }

    const linesByItem = new Map<string, { quantity: number; unitCost: number }>();
    for (const item of quote.items) {
      if (!["EQUIPMENT", "MATERIAL", "SUPPLY"].includes(item.type)) {
        continue;
      }

      const quantity = Math.trunc(Number(item.quantity) || 0);
      if (quantity <= 0) {
        continue;
      }

      let inventoryItemId = item.inventoryItemId;
      if (!inventoryItemId) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            name: { equals: item.description, mode: "insensitive" },
            managedStock: true,
            sourceType: { not: "ARCHIVED" },
          },
          select: { id: true },
        });
        inventoryItemId = inventoryItem?.id ?? null;
        if (inventoryItemId) {
          await tx.quoteItem.update({
            where: { id: item.id },
            data: { inventoryItemId },
          });
        }
      }

      if (!inventoryItemId) {
        continue;
      }

      const current = linesByItem.get(inventoryItemId) ?? { quantity: 0, unitCost: Number(item.unitCost) || 0 };
      linesByItem.set(inventoryItemId, {
        quantity: current.quantity + quantity,
        unitCost: current.unitCost,
      });
    }

    const lines = [...linesByItem.entries()].map(([itemId, line]) => ({ itemId, ...line }));
    if (!lines.length) {
      return;
    }

    const movements = await tx.inventoryMovement.findMany({
      where: {
        workOrderId: workOrder.id,
        itemId: { in: lines.map((line) => line.itemId) },
      },
      select: { itemId: true, type: true, quantity: true },
    });
    const currentByItem = new Map<string, number>();
    for (const movement of movements) {
      const signedQuantity = movement.type === "IN" ? -movement.quantity : movement.type === "OUT" ? movement.quantity : 0;
      currentByItem.set(movement.itemId, (currentByItem.get(movement.itemId) ?? 0) + signedQuantity);
    }

    const missingLines = lines
      .map((line) => ({
        ...line,
        quantity: Math.max(0, line.quantity - (currentByItem.get(line.itemId) ?? 0)),
      }))
      .filter((line) => line.quantity > 0);
    if (!missingLines.length) {
      await this.syncApprovedQuotePayment(tx, quote, workOrder.id);
      return;
    }

    const inventoryItems = await tx.inventoryItem.findMany({
      where: { id: { in: missingLines.map((line) => line.itemId) } },
      select: { id: true, name: true, stock: true, costPrice: true, currency: true, sourceType: true },
    });
    const itemById = new Map(inventoryItems.map((item) => [item.id, item]));

    for (const line of missingLines) {
      const item = itemById.get(line.itemId);
      if (!item) {
        throw new NotFoundException("Uno o mas articulos del presupuesto ya no existen en almacen");
      }

      const stockAfter = item.stock - line.quantity;
      if (stockAfter < 0) {
        throw new BadRequestException(`Stock insuficiente para ${item.name}. Disponible: ${item.stock}`);
      }

      const unitCost = Number(item.costPrice ?? line.unitCost ?? 0) || 0;
      const totalCost = unitCost * line.quantity;
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: stockAfter, managedStock: true },
      });

      await tx.inventoryMovement.create({
        data: {
          itemId: item.id,
          quoteId: quote.id,
          type: "OUT",
          quantity: line.quantity,
          stockAfter,
          unitCost,
          totalCost,
          currency: item.currency ?? quote.currency ?? "UYU",
          sourceType: item.sourceType,
          customerId: quote.customerId,
          reason: `Descuento automatico por aprobacion de presupuesto ${quote.number}`,
          workOrderId: workOrder.id,
        },
      });
    }

    await this.syncApprovedQuotePayment(tx, quote, workOrder.id);
  }

  private async syncApprovedQuotePayment(
    tx: Prisma.TransactionClient,
    quote: {
      id: string;
      number: string;
      title: string;
      customerId: string;
      total: Prisma.Decimal;
      currency: string;
    },
    workOrderId: string,
  ) {
    const amount = this.roundMoney(Number(quote.total) || 0);
    if (amount <= 0) {
      return;
    }

    const reference = `AUTO-QUOTE-${quote.number}`;
    const existing = await tx.payment.findFirst({
      where: {
        quoteId: quote.id,
        transactionType: "INCOME",
        reference,
      },
      select: { id: true, paidAt: true },
    });

    const matchingManualPayment = await tx.payment.findFirst({
      where: {
        quoteId: null,
        customerId: quote.customerId,
        transactionType: "INCOME",
        currency: quote.currency,
        amount,
      },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });

    if (existing) {
      if (!existing.paidAt && matchingManualPayment) {
        await tx.payment.update({
          where: { id: matchingManualPayment.id },
          data: {
            quoteId: quote.id,
            workOrderId,
            category: "QUOTE_BALANCE",
            notes: "Cobro manual vinculado automaticamente al presupuesto aprobado",
          },
        });
        await tx.payment.delete({ where: { id: existing.id } });
        return;
      }
      if (!existing.paidAt) {
        await tx.payment.update({
          where: { id: existing.id },
          data: {
            customerId: quote.customerId,
            workOrderId,
            concept: `Presupuesto aprobado ${quote.number} - ${quote.title}`,
            amount,
            currency: quote.currency,
            category: "QUOTE_BALANCE",
            notes: "Ingreso esperado generado automaticamente desde presupuesto aprobado",
          },
        });
      }
      return;
    }

    if (matchingManualPayment) {
      await tx.payment.update({
        where: { id: matchingManualPayment.id },
        data: {
          quoteId: quote.id,
          workOrderId,
          category: "QUOTE_BALANCE",
          notes: "Cobro manual vinculado automaticamente al presupuesto aprobado",
        },
      });
      return;
    }

    await tx.payment.create({
      data: {
        customerId: quote.customerId,
        quoteId: quote.id,
        workOrderId,
        transactionType: "INCOME",
        category: "QUOTE_BALANCE",
        concept: `Presupuesto aprobado ${quote.number} - ${quote.title}`,
        amount,
        currency: quote.currency,
        reference,
        notes: "Ingreso esperado generado automaticamente desde presupuesto aprobado",
      },
    });
  }
}
