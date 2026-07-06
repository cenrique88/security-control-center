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
exports.WorkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkOrdersService = class WorkOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {};
        if (filters.customerId) {
            where.customerId = filters.customerId;
        }
        if (filters.siteId) {
            where.siteId = filters.siteId;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.search?.trim()) {
            const query = filters.search.trim();
            where.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { notes: { contains: query, mode: "insensitive" } },
                { customer: { name: { contains: query, mode: "insensitive" } } },
                { site: { name: { contains: query, mode: "insensitive" } } },
                { site: { address: { contains: query, mode: "insensitive" } } },
            ];
        }
        return this.prisma.workOrder.findMany({
            where,
            orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
            include: this.includeRelations(),
        });
    }
    async create(dto) {
        await this.ensureCustomer(dto.customerId);
        if (dto.siteId) {
            await this.ensureSiteBelongsToCustomer(dto.siteId, dto.customerId);
        }
        return this.prisma.workOrder.create({
            data: {
                customerId: dto.customerId,
                siteId: this.cleanOptional(dto.siteId),
                title: dto.title.trim(),
                type: dto.type,
                status: dto.status ?? "SCHEDULED",
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
                completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
                notes: this.cleanOptional(dto.notes),
                reportBeforeNotes: this.cleanOptional(dto.reportBeforeNotes),
                reportAfterNotes: this.cleanOptional(dto.reportAfterNotes),
                reportTasks: this.cleanOptional(dto.reportTasks),
                reportTests: this.cleanOptional(dto.reportTests),
                reportRecommendations: this.cleanOptional(dto.reportRecommendations),
                reportPhotos: dto.reportPhotos,
            },
            include: this.includeRelations(),
        });
    }
    async update(id, dto) {
        const current = await this.prisma.workOrder.findUnique({
            where: { id },
            select: { id: true, customerId: true },
        });
        if (!current) {
            throw new common_1.NotFoundException("Work order not found");
        }
        const customerId = dto.customerId ?? current.customerId;
        if (dto.customerId) {
            await this.ensureCustomer(dto.customerId);
        }
        if (dto.siteId) {
            await this.ensureSiteBelongsToCustomer(dto.siteId, customerId);
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                customerId: dto.customerId,
                siteId: dto.siteId === "" ? null : this.cleanNullable(dto.siteId),
                title: this.cleanOptional(dto.title),
                type: dto.type,
                status: dto.status,
                scheduledAt: dto.scheduledAt === "" ? null : dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
                completedAt: dto.completedAt === "" ? null : dto.completedAt ? new Date(dto.completedAt) : undefined,
                notes: this.cleanNullable(dto.notes),
                reportBeforeNotes: this.cleanNullable(dto.reportBeforeNotes),
                reportAfterNotes: this.cleanNullable(dto.reportAfterNotes),
                reportTasks: this.cleanNullable(dto.reportTasks),
                reportTests: this.cleanNullable(dto.reportTests),
                reportRecommendations: this.cleanNullable(dto.reportRecommendations),
                reportPhotos: dto.reportPhotos,
            },
            include: this.includeRelations(),
        });
    }
    async addMaterial(id, dto) {
        return this.prisma.$transaction(async (tx) => {
            const workOrder = await tx.workOrder.findUnique({
                where: { id },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    siteId: true,
                    customerId: true,
                    customer: {
                        select: {
                            name: true,
                            address: true,
                        },
                    },
                },
            });
            if (!workOrder) {
                throw new common_1.NotFoundException("Work order not found");
            }
            const item = await tx.inventoryItem.findUnique({
                where: { id: dto.itemId },
                select: {
                    id: true,
                    sku: true,
                    name: true,
                    category: true,
                    supplier: true,
                    stock: true,
                },
            });
            if (!item) {
                throw new common_1.NotFoundException("Inventory item not found");
            }
            const stockAfter = item.stock - dto.quantity;
            if (stockAfter < 0) {
                throw new common_1.BadRequestException("Stock cannot be negative");
            }
            await tx.inventoryItem.update({
                where: { id: item.id },
                data: { stock: stockAfter, managedStock: true },
            });
            if (!dto.installAsDevice) {
                return tx.inventoryMovement.create({
                    data: {
                        itemId: item.id,
                        type: "OUT",
                        quantity: dto.quantity,
                        stockAfter,
                        reason: "Asignado a orden de trabajo",
                        workOrderId: workOrder.id,
                    },
                    include: {
                        item: true,
                        workOrder: {
                            select: {
                                id: true,
                                title: true,
                                customer: { select: { id: true, name: true } },
                            },
                        },
                        installedDevice: true,
                    },
                });
            }
            const targetSiteId = dto.installAsDevice
                ? await this.ensureWorkOrderSite(tx, workOrder)
                : workOrder.siteId;
            const movements = [];
            for (let index = 0; index < dto.quantity; index += 1) {
                const device = await tx.installedDevice.create({
                    data: {
                        siteId: targetSiteId,
                        type: item.category ?? workOrder.type,
                        brand: this.cleanOptional(item.supplier ?? undefined),
                        model: item.name,
                        installedAt: new Date(),
                        notes: [workOrder.title, item.sku ? `SKU ${item.sku}` : ""].filter(Boolean).join(" - "),
                    },
                });
                movements.push(await tx.inventoryMovement.create({
                    data: {
                        itemId: item.id,
                        type: "OUT",
                        quantity: 1,
                        stockAfter: item.stock - index - 1,
                        reason: "Asignado a orden de trabajo e instalado como equipo",
                        workOrderId: workOrder.id,
                        installedDeviceId: device.id,
                    },
                    include: {
                        item: true,
                        workOrder: {
                            select: {
                                id: true,
                                title: true,
                                customer: { select: { id: true, name: true } },
                            },
                        },
                        installedDevice: true,
                    },
                }));
            }
            return movements;
        });
    }
    includeRelations() {
        return {
            customer: {
                select: {
                    id: true,
                    name: true,
                    reference: true,
                    taxId: true,
                    logoUrl: true,
                    email: true,
                    phone: true,
                    address: true,
                    latitude: true,
                    longitude: true,
                    traccarGeofenceId: true,
                    sites: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            latitude: true,
                            longitude: true,
                            traccarGeofenceId: true,
                        },
                    },
                },
            },
            site: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    latitude: true,
                    longitude: true,
                    traccarGeofenceId: true,
                },
            },
            inventoryMovements: {
                orderBy: { createdAt: "desc" },
                include: {
                    item: {
                        select: {
                            id: true,
                            sku: true,
                            name: true,
                            unit: true,
                        },
                    },
                    installedDevice: {
                        select: {
                            id: true,
                            brand: true,
                            model: true,
                            serial: true,
                            ipAddress: true,
                        },
                    },
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
    async ensureSiteBelongsToCustomer(siteId, customerId) {
        const site = await this.prisma.site.findUnique({
            where: { id: siteId },
            select: { id: true, customerId: true },
        });
        if (!site) {
            throw new common_1.NotFoundException("Site not found");
        }
        if (site.customerId !== customerId) {
            throw new common_1.BadRequestException("Site does not belong to customer");
        }
    }
    async ensureWorkOrderSite(tx, workOrder) {
        if (workOrder.siteId) {
            return workOrder.siteId;
        }
        const siteName = workOrder.customer.name.trim();
        const existingSite = await tx.site.findFirst({
            where: {
                customerId: workOrder.customerId,
                name: { equals: siteName, mode: "insensitive" },
            },
            select: { id: true },
        });
        const site = existingSite ??
            (await tx.site.create({
                data: {
                    customerId: workOrder.customerId,
                    name: siteName,
                    address: workOrder.customer.address?.trim() || "Direccion principal",
                    notes: "Sitio predeterminado creado automaticamente",
                },
                select: { id: true },
            }));
        await tx.workOrder.update({
            where: { id: workOrder.id },
            data: { siteId: site.id },
        });
        return site.id;
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
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrdersService);
//# sourceMappingURL=work-orders.service.js.map