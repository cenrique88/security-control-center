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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const STOCK_EXPENSE_CATEGORIES = new Set(["MATERIAL_PURCHASE", "SUPPLIES", "IMPORTER_PAYMENT", "TOOLS"]);
const INTERNAL_COST_CATEGORIES = new Set(["WORK_ORDER_MATERIAL_COST"]);
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {};
        const andFilters = [];
        if (filters.customerId) {
            where.customerId = filters.customerId;
        }
        if (filters.type) {
            where.transactionType = filters.type;
        }
        if (filters.category) {
            where.category = filters.category;
        }
        if (!filters.category && !filters.includeInternalCosts) {
            andFilters.push({
                NOT: {
                    category: {
                        in: Array.from(INTERNAL_COST_CATEGORIES),
                    },
                },
            });
        }
        if (filters.status === "PAID") {
            where.paidAt = { not: null };
        }
        if (filters.status === "PENDING") {
            where.paidAt = null;
        }
        if (filters.status === "OVERDUE") {
            where.paidAt = null;
            where.dueDate = { lt: new Date() };
        }
        if (filters.period === "CURRENT_MONTH") {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            andFilters.push({
                OR: [
                    { paidAt: { gte: monthStart, lt: nextMonthStart } },
                    { paidAt: null, createdAt: { gte: monthStart, lt: nextMonthStart } },
                ],
            });
        }
        if (filters.search?.trim()) {
            const query = filters.search.trim();
            andFilters.push({
                OR: [
                    { concept: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                    { method: { contains: query, mode: "insensitive" } },
                    { reference: { contains: query, mode: "insensitive" } },
                    { customer: { name: { contains: query, mode: "insensitive" } } },
                ],
            });
        }
        if (andFilters.length) {
            where.AND = andFilters;
        }
        return this.prisma.payment.findMany({
            where,
            orderBy: [{ paidAt: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
            include: this.includeCustomer(),
        });
    }
    async create(dto) {
        const customer = await this.ensureCustomer(dto.customerId);
        await this.ensureOptionalLinks(dto);
        const transactionType = dto.transactionType ?? "INCOME";
        const category = this.cleanOptional(dto.category) ?? (transactionType === "EXPENSE" ? "OTHER_EXPENSE" : "CLIENT_PAYMENT");
        const quantity = Number(dto.quantity) || undefined;
        const unitPrice = Number(dto.unitPrice) || (quantity ? Number(dto.amount) / quantity : undefined);
        const shouldCreateInventoryEntry = transactionType === "EXPENSE" &&
            STOCK_EXPENSE_CATEGORIES.has(category) &&
            dto.createInventoryEntry !== false &&
            Boolean(quantity && quantity > 0) &&
            Boolean(this.cleanOptional(dto.inventoryItemId) || this.cleanOptional(dto.inventoryItemName) || this.cleanOptional(dto.concept));
        return this.prisma.$transaction(async (tx) => {
            const inventoryItem = shouldCreateInventoryEntry
                ? await this.findOrCreateInventoryItem(tx, dto, customer.name)
                : this.cleanOptional(dto.inventoryItemId)
                    ? await this.findInventoryItem(tx, dto.inventoryItemId)
                    : null;
            if (shouldCreateInventoryEntry && !inventoryItem) {
                throw new common_1.BadRequestException("No se pudo vincular el articulo al almacen");
            }
            const payment = await tx.payment.create({
                data: {
                    customerId: dto.customerId,
                    quoteId: this.cleanOptional(dto.quoteId),
                    workOrderId: this.cleanOptional(dto.workOrderId),
                    vehicleId: this.cleanOptional(dto.vehicleId),
                    inventoryItemId: inventoryItem?.id,
                    transactionType,
                    category,
                    concept: dto.concept.trim(),
                    amount: Number(dto.amount),
                    quantity,
                    unitPrice,
                    currency: this.cleanOptional(dto.currency) ?? "UYU",
                    method: this.cleanOptional(dto.method),
                    reference: this.cleanOptional(dto.reference),
                    notes: this.cleanOptional(dto.notes),
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                    paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
                },
                include: this.includeCustomer(),
            });
            if (shouldCreateInventoryEntry && inventoryItem && quantity) {
                const stockAfter = inventoryItem.stock + quantity;
                const totalCost = Number(dto.amount) || (Number(unitPrice) || 0) * quantity;
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        stock: stockAfter,
                        managedStock: true,
                        sourceType: this.cleanOptional(dto.inventorySourceType) ?? this.sourceTypeFromCategory(category),
                        customerId: dto.customerId,
                        supplier: customer.name,
                        supplierCategory: this.cleanOptional(dto.category),
                        costPrice: unitPrice,
                        priceWithTax: unitPrice,
                        currency: this.cleanOptional(dto.currency) ?? "UYU",
                    },
                });
                await tx.inventoryMovement.create({
                    data: {
                        itemId: inventoryItem.id,
                        paymentId: payment.id,
                        type: "IN",
                        quantity,
                        stockAfter,
                        unitCost: unitPrice,
                        totalCost,
                        currency: this.cleanOptional(dto.currency) ?? "UYU",
                        sourceType: this.cleanOptional(dto.inventorySourceType) ?? this.sourceTypeFromCategory(category),
                        customerId: dto.customerId,
                        reason: `Ingreso automatico por egreso: ${payment.concept}`,
                    },
                });
            }
            return payment;
        });
    }
    async update(id, dto) {
        const current = await this.prisma.payment.findUnique({ where: { id }, select: { id: true } });
        if (!current) {
            throw new common_1.NotFoundException("Payment not found");
        }
        if (dto.customerId) {
            await this.ensureCustomer(dto.customerId);
        }
        await this.ensureOptionalLinks(dto);
        return this.prisma.payment.update({
            where: { id },
            data: {
                customerId: dto.customerId,
                quoteId: this.cleanNullable(dto.quoteId),
                workOrderId: this.cleanNullable(dto.workOrderId),
                vehicleId: this.cleanNullable(dto.vehicleId),
                inventoryItemId: this.cleanNullable(dto.inventoryItemId),
                transactionType: dto.transactionType,
                category: this.cleanOptional(dto.category),
                concept: this.cleanOptional(dto.concept),
                amount: dto.amount,
                quantity: dto.quantity,
                unitPrice: dto.unitPrice,
                currency: this.cleanOptional(dto.currency),
                method: this.cleanNullable(dto.method),
                reference: this.cleanNullable(dto.reference),
                notes: this.cleanNullable(dto.notes),
                dueDate: dto.dueDate === "" ? null : dto.dueDate ? new Date(dto.dueDate) : undefined,
                paidAt: dto.paidAt === "" ? null : dto.paidAt ? new Date(dto.paidAt) : undefined,
            },
            include: this.includeCustomer(),
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id },
                include: {
                    inventoryMovements: {
                        include: {
                            item: {
                                select: { id: true, stock: true },
                            },
                        },
                    },
                },
            });
            if (!payment) {
                throw new common_1.NotFoundException("Payment not found");
            }
            for (const movement of payment.inventoryMovements) {
                const stockAfterDelete = movement.type === "OUT"
                    ? movement.item.stock + movement.quantity
                    : movement.type === "IN"
                        ? movement.item.stock - movement.quantity
                        : movement.item.stock;
                if (stockAfterDelete < 0) {
                    throw new common_1.BadRequestException("No se puede eliminar porque dejaria stock negativo");
                }
                await tx.inventoryItem.update({
                    where: { id: movement.itemId },
                    data: { stock: stockAfterDelete, managedStock: true },
                });
                await tx.inventoryMovement.delete({ where: { id: movement.id } });
            }
            return tx.payment.delete({
                where: { id },
                include: this.includeCustomer(),
            });
        });
    }
    includeCustomer() {
        return {
            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    type: true,
                },
            },
            quote: { select: { id: true, number: true, title: true, total: true } },
            workOrder: { select: { id: true, title: true, status: true } },
            vehicle: { select: { id: true, name: true, plate: true } },
            inventoryItem: { select: { id: true, reference: true, sku: true, name: true, unit: true, stock: true, sourceType: true } },
            inventoryMovements: {
                select: {
                    id: true,
                    type: true,
                    quantity: true,
                    stockAfter: true,
                    unitCost: true,
                    totalCost: true,
                    currency: true,
                    createdAt: true,
                    item: { select: { id: true, name: true, sku: true, unit: true } },
                },
            },
        };
    }
    async ensureCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true, name: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
        return customer;
    }
    async ensureOptionalLinks(dto) {
        if (dto.quoteId) {
            const quote = await this.prisma.quote.findUnique({ where: { id: dto.quoteId }, select: { id: true } });
            if (!quote) {
                throw new common_1.NotFoundException("Quote not found");
            }
        }
        if (dto.workOrderId) {
            const workOrder = await this.prisma.workOrder.findUnique({ where: { id: dto.workOrderId }, select: { id: true } });
            if (!workOrder) {
                throw new common_1.NotFoundException("Work order not found");
            }
        }
        if (dto.vehicleId) {
            const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId }, select: { id: true } });
            if (!vehicle) {
                throw new common_1.NotFoundException("Vehicle not found");
            }
        }
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
    cleanNullable(value) {
        if (value === undefined) {
            return undefined;
        }
        const clean = value.trim();
        return clean ? clean : null;
    }
    async findInventoryItem(tx, itemId) {
        const cleanItemId = this.cleanOptional(itemId);
        if (!cleanItemId) {
            return null;
        }
        const item = await tx.inventoryItem.findUnique({
            where: { id: cleanItemId },
            select: { id: true, stock: true },
        });
        if (!item) {
            throw new common_1.NotFoundException("Inventory item not found");
        }
        return item;
    }
    async findOrCreateInventoryItem(tx, dto, supplierName) {
        const cleanItemId = this.cleanOptional(dto.inventoryItemId);
        if (cleanItemId) {
            return this.findInventoryItem(tx, cleanItemId);
        }
        const sku = this.cleanOptional(dto.inventorySku);
        if (sku) {
            const itemBySku = await tx.inventoryItem.findUnique({ where: { sku }, select: { id: true, stock: true } });
            if (itemBySku) {
                return itemBySku;
            }
        }
        const name = this.cleanOptional(dto.inventoryItemName) ?? dto.concept.trim();
        const existing = await tx.inventoryItem.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
            select: { id: true, stock: true },
        });
        if (existing) {
            return existing;
        }
        return tx.inventoryItem.create({
            data: {
                reference: await this.nextInventoryReference(tx),
                sku,
                name,
                unit: this.cleanOptional(dto.inventoryUnit) ?? "u",
                stock: 0,
                minStock: 0,
                managedStock: true,
                sourceType: this.cleanOptional(dto.inventorySourceType) ?? this.sourceTypeFromCategory(dto.category),
                customerId: dto.customerId,
                supplier: supplierName,
                supplierCategory: this.cleanOptional(dto.category),
                costPrice: dto.unitPrice,
                priceWithTax: dto.unitPrice,
                currency: this.cleanOptional(dto.currency) ?? "UYU",
                notes: dto.notes ? `Creado desde gasto: ${dto.notes}` : "Creado desde gasto automatico",
            },
            select: { id: true, stock: true },
        });
    }
    async nextInventoryReference(tx) {
        const lastItem = await tx.inventoryItem.findFirst({
            orderBy: { createdAt: "desc" },
            select: { reference: true },
        });
        const lastNumber = Number(lastItem?.reference?.replace(/\D/g, "")) || 0;
        return `ART-${String(lastNumber + 1).padStart(5, "0")}`;
    }
    sourceTypeFromCategory(category) {
        if (category === "TOOLS") {
            return "ASSET";
        }
        if (category === "IMPORTER_PAYMENT") {
            return "MATERIAL";
        }
        return "MATERIAL";
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map