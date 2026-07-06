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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DevicesService = class DevicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {
            inventoryMovements: {
                some: {
                    workOrderId: { not: null },
                },
            },
        };
        if (filters.siteId) {
            where.siteId = filters.siteId;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.customerId) {
            where.site = { customerId: filters.customerId };
        }
        if (filters.search?.trim()) {
            const query = filters.search.trim();
            where.OR = [
                { brand: { contains: query, mode: "insensitive" } },
                { model: { contains: query, mode: "insensitive" } },
                { serial: { contains: query, mode: "insensitive" } },
                { ipAddress: { contains: query, mode: "insensitive" } },
                { notes: { contains: query, mode: "insensitive" } },
                { site: { name: { contains: query, mode: "insensitive" } } },
                { site: { customer: { name: { contains: query, mode: "insensitive" } } } },
                { inventoryMovements: { some: { workOrder: { title: { contains: query, mode: "insensitive" } } } } },
            ];
        }
        return this.prisma.installedDevice.findMany({
            where,
            orderBy: [{ updatedAt: "desc" }],
            include: {
                site: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        customer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                inventoryMovements: {
                    where: { workOrderId: { not: null } },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        workOrderId: true,
                        createdAt: true,
                        workOrder: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                scheduledAt: true,
                                completedAt: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async create(dto) {
        const site = await this.prisma.site.findUnique({ where: { id: dto.siteId }, select: { id: true } });
        if (!site) {
            throw new common_1.NotFoundException("Site not found");
        }
        return this.prisma.installedDevice.create({
            data: {
                siteId: dto.siteId,
                type: dto.type,
                brand: this.cleanOptional(dto.brand),
                model: this.cleanOptional(dto.model),
                serial: this.cleanOptional(dto.serial),
                ipAddress: this.cleanOptional(dto.ipAddress),
                installedAt: dto.installedAt ? new Date(dto.installedAt) : undefined,
                notes: this.cleanOptional(dto.notes),
            },
            include: {
                site: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        customer: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                inventoryMovements: {
                    where: { workOrderId: { not: null } },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        workOrderId: true,
                        createdAt: true,
                        workOrder: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                scheduledAt: true,
                                completedAt: true,
                            },
                        },
                    },
                },
            },
        });
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map