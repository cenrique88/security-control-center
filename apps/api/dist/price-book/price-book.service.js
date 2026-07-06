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
exports.PriceBookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PriceBookService = class PriceBookService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(filters) {
        const where = {};
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
    create(dto) {
        return this.prisma.priceBookItem.create({
            data: this.cleanPriceBookPayload(dto),
        });
    }
    async update(id, dto) {
        await this.ensurePriceBookItem(id);
        return this.prisma.priceBookItem.update({
            where: { id },
            data: this.cleanPriceBookPayload(dto),
        });
    }
    async laborRates(customerId) {
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
    async updateLaborRate(id, dto) {
        const current = await this.prisma.laborPointRate.findUnique({ where: { id }, select: { id: true } });
        if (!current) {
            throw new common_1.NotFoundException("Labor point rate not found");
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
    async customerLaborRates(customerId) {
        return this.prisma.customerLaborPointRate.findMany({
            where: customerId ? { customerId } : undefined,
            orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
            include: { customer: { select: { id: true, name: true } } },
        });
    }
    async createCustomerLaborRate(dto) {
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
    async updateCustomerLaborRate(id, dto) {
        const current = await this.prisma.customerLaborPointRate.findUnique({ where: { id }, select: { id: true } });
        if (!current) {
            throw new common_1.NotFoundException("Customer labor point rate not found");
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
    async customerPriceOverrides(customerId) {
        return this.prisma.customerPriceOverride.findMany({
            where: customerId ? { customerId } : undefined,
            orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
            include: {
                customer: { select: { id: true, name: true } },
                priceBookItem: { select: { id: true, code: true, name: true, category: true, salePrice: true } },
            },
        });
    }
    async upsertCustomerPriceOverride(dto) {
        await this.ensureCustomer(dto.customerId);
        await this.ensurePriceBookItem(dto.priceBookItemId);
        return this.prisma.customerPriceOverride.upsert({
            where: { customerId_priceBookItemId: { customerId: dto.customerId, priceBookItemId: dto.priceBookItemId } },
            create: this.cleanCustomerPriceOverridePayload(dto),
            update: this.cleanCustomerPriceOverridePayload(dto),
        });
    }
    async updateCustomerPriceOverride(id, dto) {
        const current = await this.prisma.customerPriceOverride.findUnique({ where: { id }, select: { id: true } });
        if (!current) {
            throw new common_1.NotFoundException("Customer price override not found");
        }
        await this.ensureCustomer(dto.customerId);
        await this.ensurePriceBookItem(dto.priceBookItemId);
        return this.prisma.customerPriceOverride.update({
            where: { id },
            data: this.cleanCustomerPriceOverridePayload(dto),
        });
    }
    async calculateLaborPoints(points, rateId, customerId) {
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
    async effectiveLaborPointRate(customerId, rateId) {
        if (rateId) {
            const customerRate = await this.prisma.customerLaborPointRate.findUnique({ where: { id: rateId } });
            if (customerRate) {
                return {
                    id: customerRate.id,
                    name: customerRate.name,
                    source: "CUSTOMER",
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
                    source: "DEFAULT",
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
                    source: "CUSTOMER",
                    customerId: customerRate.customerId,
                    pointValue: Number(customerRate.pointValue),
                    taxRate: Number(customerRate.taxRate),
                    currency: customerRate.currency,
                };
            }
        }
        const defaultRate = await this.prisma.laborPointRate.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });
        if (!defaultRate) {
            throw new common_1.NotFoundException("Labor point rate not found");
        }
        return {
            id: defaultRate.id,
            name: defaultRate.name,
            source: "DEFAULT",
            customerId: undefined,
            pointValue: Number(defaultRate.pointValue),
            taxRate: Number(defaultRate.taxRate),
            currency: defaultRate.currency,
        };
    }
    async ensureCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
    }
    async ensurePriceBookItem(id) {
        const item = await this.prisma.priceBookItem.findUnique({ where: { id }, select: { id: true } });
        if (!item) {
            throw new common_1.NotFoundException("Price book item not found");
        }
    }
    cleanPriceBookPayload(dto) {
        return {
            code: dto.code.trim(),
            name: dto.name.trim(),
            type: dto.type ?? "EQUIPMENT",
            category: dto.category.trim(),
            service: dto.service,
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
    cleanCustomerPriceOverridePayload(dto) {
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
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
    roundMoney(value) {
        return Math.round(value * 100) / 100;
    }
};
exports.PriceBookService = PriceBookService;
exports.PriceBookService = PriceBookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PriceBookService);
//# sourceMappingURL=price-book.service.js.map