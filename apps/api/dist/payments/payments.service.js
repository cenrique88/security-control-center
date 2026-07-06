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
        return this.prisma.payment.create({
            data: {
                customerId: dto.customerId,
                concept: dto.concept.trim(),
                amount: Number(dto.amount),
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
        return this.prisma.payment.update({
            where: { id },
            data: {
                customerId: dto.customerId,
                concept: this.cleanOptional(dto.concept),
                amount: dto.amount,
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
                },
            },
        };
    }
    async ensureCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map