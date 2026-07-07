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
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {};
        if (filters.customerId) {
            where.customerId = filters.customerId;
        }
        if (filters.type) {
            where.transactionType = filters.type;
        }
        if (filters.category) {
            where.category = filters.category;
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
        if (filters.search?.trim()) {
            const query = filters.search.trim();
            where.OR = [
                { concept: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
                { method: { contains: query, mode: "insensitive" } },
                { reference: { contains: query, mode: "insensitive" } },
                { customer: { name: { contains: query, mode: "insensitive" } } },
            ];
        }
        return this.prisma.payment.findMany({
            where,
            orderBy: [{ paidAt: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
            include: this.includeCustomer(),
        });
    }
    async create(dto) {
        await this.ensureCustomer(dto.customerId);
        await this.ensureOptionalLinks(dto);
        return this.prisma.payment.create({
            data: {
                customerId: dto.customerId,
                quoteId: this.cleanOptional(dto.quoteId),
                workOrderId: this.cleanOptional(dto.workOrderId),
                vehicleId: this.cleanOptional(dto.vehicleId),
                transactionType: dto.transactionType ?? "INCOME",
                category: this.cleanOptional(dto.category) ?? "CLIENT_PAYMENT",
                concept: dto.concept.trim(),
                amount: Number(dto.amount),
                currency: this.cleanOptional(dto.currency) ?? "UYU",
                method: this.cleanOptional(dto.method),
                reference: this.cleanOptional(dto.reference),
                notes: this.cleanOptional(dto.notes),
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
            },
            include: this.includeCustomer(),
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
                transactionType: dto.transactionType,
                category: this.cleanOptional(dto.category),
                concept: this.cleanOptional(dto.concept),
                amount: dto.amount,
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
        };
    }
    async ensureCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map