"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let QuotesService = class QuotesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async list(filters) {
        const where = {};
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
            where.status = filters.status;
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
    async create(dto) {
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
            pricingMode: dto.pricingMode ?? "DIRECT",
            refreshLaborItem: true,
        });
        const quote = await this.prisma.$transaction(async (tx) => {
            const quote = await tx.quote.create({
                data: {
                    customerId: dto.customerId,
                    meetingId: this.cleanOptional(dto.meetingId),
                    number: dto.number?.trim() || (await this.nextNumber()),
                    title: dto.title.trim(),
                    service: dto.service ?? "OTHER",
                    status: dto.status ?? "DRAFT",
                    pricingMode: dto.pricingMode ?? "DIRECT",
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
        await this.audit.record({
            module: "QUOTES",
            action: "QUOTE_CREATED",
            entityType: "Quote",
            entityId: quote.id,
            severity: quote.status === "APPROVED" ? client_1.AuditSeverity.WARNING : client_1.AuditSeverity.INFO,
            summary: `Presupuesto creado: ${quote.number} - ${quote.title}`,
            metadata: {
                customerId: quote.customerId,
                customerName: quote.customer.name,
                status: quote.status,
                total: Number(quote.total),
                currency: quote.currency,
                costTotal: Number(quote.costTotal),
                estimatedProfit: Number(quote.estimatedProfit),
            },
        });
        return quote;
    }
    async update(id, dto) {
        const current = await this.prisma.quote.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!current) {
            throw new common_1.NotFoundException("Quote not found");
        }
        if (dto.customerId) {
            await this.ensureCustomer(dto.customerId);
        }
        if (dto.meetingId) {
            await this.ensureMeeting(dto.meetingId);
        }
        const itemsForCalculation = dto.items ??
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
        const pricingMode = dto.pricingMode ?? current.pricingMode;
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
        const status = dto.acceptedAt ? "APPROVED" : dto.status;
        const acceptedAt = dto.acceptedAt === ""
            ? null
            : dto.acceptedAt
                ? new Date(dto.acceptedAt)
                : dto.status === "APPROVED"
                    ? new Date()
                    : undefined;
        const quote = await this.prisma.$transaction(async (tx) => {
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
                    service: dto.service,
                    status,
                    pricingMode: dto.pricingMode,
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
        await this.audit.record({
            module: "QUOTES",
            action: quote.status === "APPROVED" && current.status !== "APPROVED" ? "QUOTE_APPROVED" : "QUOTE_UPDATED",
            entityType: "Quote",
            entityId: quote.id,
            severity: quote.status === "APPROVED" && current.status !== "APPROVED" ? client_1.AuditSeverity.CRITICAL : client_1.AuditSeverity.WARNING,
            summary: quote.status === "APPROVED" && current.status !== "APPROVED"
                ? `Presupuesto aprobado: ${quote.number} - ${quote.title}`
                : `Presupuesto actualizado: ${quote.number} - ${quote.title}`,
            metadata: {
                customerId: quote.customerId,
                customerName: quote.customer.name,
                previousStatus: current.status,
                status: quote.status,
                total: Number(quote.total),
                currency: quote.currency,
                costTotal: Number(quote.costTotal),
                estimatedProfit: Number(quote.estimatedProfit),
                itemsUpdated: Boolean(dto.items),
            },
        });
        return quote;
    }
    async remove(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!quote) {
            throw new common_1.NotFoundException("Quote not found");
        }
        const deleted = await this.prisma.$transaction(async (tx) => {
            await tx.payment.updateMany({
                where: { quoteId: id },
                data: { quoteId: null },
            });
            return tx.quote.delete({
                where: { id },
                include: this.includeCustomer(),
            });
        });
        await this.audit.record({
            module: "QUOTES",
            action: "QUOTE_DELETED",
            entityType: "Quote",
            entityId: deleted.id,
            severity: client_1.AuditSeverity.CRITICAL,
            summary: `Presupuesto eliminado: ${deleted.number} - ${deleted.title}`,
            metadata: {
                customerId: deleted.customerId,
                customerName: deleted.customer.name,
                status: deleted.status,
                total: Number(deleted.total),
                currency: deleted.currency,
            },
        });
        return deleted;
    }
    includeCustomer() {
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
        };
    }
    async ensureCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
    }
    async ensureMeeting(id) {
        const meeting = await this.prisma.meeting.findUnique({ where: { id }, select: { id: true } });
        if (!meeting) {
            throw new common_1.NotFoundException("Meeting not found");
        }
    }
    async nextNumber() {
        const quotes = await this.prisma.quote.findMany({
            where: {
                number: {
                    startsWith: "P-",
                },
            },
            select: {
                number: true,
            },
        });
        const lastNumber = quotes.reduce((max, quote) => {
            const value = Number(quote.number?.replace(/\D/g, "")) || 0;
            return Math.max(max, value);
        }, 0);
        return `P-${String(lastNumber + 1).padStart(5, "0")}`;
    }
    roundMoney(value) {
        return Math.round(value * 100) / 100;
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
    async calculateTotals(customerId, items, fallback) {
        const fallbackSubtotal = Number(fallback.subtotal) || 0;
        const pricingMode = fallback.pricingMode ?? "DIRECT";
        const taxEnabled = fallback.taxEnabled ?? true;
        const shouldUseFallbackSubtotal = pricingMode === "MANUAL" || !items.length;
        const baseItems = items.length || fallbackSubtotal <= 0 || !shouldUseFallbackSubtotal
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
        const pricedItems = pricingMode === "THIRD_PARTY"
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
        const discountAmount = this.roundMoney(Math.min(subtotal, Math.max(0, Number.isFinite(fallbackDiscountAmount) ? fallbackDiscountAmount : subtotal * (discountPercent / 100))));
        const taxableBase = this.roundMoney(Math.max(0, subtotal - discountAmount));
        const tax = normalizedItems.length
            ? this.roundMoney(normalizedItems.reduce((sum, item) => sum + item.taxAmount, 0) * (taxableBase / (subtotal || 1)))
            : taxEnabled
                ? Number(fallback.tax ?? this.roundMoney(taxableBase * 0.22))
                : 0;
        const total = this.roundMoney(taxableBase + tax);
        const costTotal = this.roundMoney(normalizedItems.reduce((sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0), 0));
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
    async withAutomaticLaborItem(customerId, items, laborPoints, refreshLaborItem) {
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
    async effectiveLaborPointRate(customerId) {
        const customerRate = await this.prisma.customerLaborPointRate.findFirst({
            where: { customerId, active: true },
            orderBy: { updatedAt: "desc" },
        });
        if (customerRate) {
            return {
                source: "CUSTOMER",
                name: customerRate.name,
                pointValue: Number(customerRate.pointValue),
                taxRate: Number(customerRate.taxRate),
            };
        }
        const defaultRate = await this.prisma.laborPointRate.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });
        if (!defaultRate) {
            throw new common_1.NotFoundException("Labor point rate not found");
        }
        return {
            source: "DEFAULT",
            name: defaultRate.name,
            pointValue: Number(defaultRate.pointValue),
            taxRate: Number(defaultRate.taxRate),
        };
    }
    sumByType(items, types) {
        return this.roundMoney(items.filter((item) => types.includes(item.type)).reduce((sum, item) => sum + item.subtotal, 0));
    }
    toQuoteItemCreate(item) {
        return {
            priceBookItem: item.priceBookItemId ? { connect: { id: item.priceBookItemId } } : undefined,
            inventoryItem: item.inventoryItemId ? { connect: { id: item.inventoryItemId } } : undefined,
            type: item.type,
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
    async syncApprovedQuoteToWorkOrder(tx, quoteId, scheduledAt) {
        const quote = await tx.quote.findUnique({
            where: { id: quoteId },
            include: {
                items: true,
                workOrder: { select: { id: true } },
            },
        });
        if (!quote) {
            throw new common_1.NotFoundException("Quote not found");
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
        const linesByItem = new Map();
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
        const currentByItem = new Map();
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
                throw new common_1.NotFoundException("Uno o mas articulos del presupuesto ya no existen en almacen");
            }
            const stockAfter = item.stock - line.quantity;
            if (stockAfter < 0) {
                throw new common_1.BadRequestException(`Stock insuficiente para ${item.name}. Disponible: ${item.stock}`);
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
    async syncApprovedQuotePayment(tx, quote, workOrderId) {
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
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map