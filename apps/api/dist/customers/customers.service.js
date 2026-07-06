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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.search) {
            const query = filters.search.trim();
            where.OR = [
                { reference: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
                { legalName: { contains: query, mode: "insensitive" } },
                { taxId: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
            ];
        }
        return this.prisma.customer.findMany({
            where,
            orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
            include: {
                _count: {
                    select: {
                        sites: true,
                        workOrders: true,
                        quotes: true,
                        payments: true,
                        meetings: true,
                    },
                },
            },
        });
    }
    async create(dto) {
        return this.prisma.customer.create({
            data: {
                ...this.toCreateData(dto),
                reference: await this.nextCustomerReference(),
            },
            include: {
                _count: {
                    select: {
                        sites: true,
                        workOrders: true,
                        quotes: true,
                        payments: true,
                        meetings: true,
                    },
                },
            },
        });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.customer.update({
            where: { id },
            data: this.toUpdateData(dto),
            include: {
                _count: {
                    select: {
                        sites: true,
                        workOrders: true,
                        quotes: true,
                        payments: true,
                        meetings: true,
                    },
                },
            },
        });
    }
    async listSites(customerId) {
        await this.ensureExists(customerId);
        return this.prisma.site.findMany({
            where: { customerId },
            orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
            include: {
                _count: {
                    select: {
                        equipment: true,
                        workOrders: true,
                    },
                },
            },
        });
    }
    async profile(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        sites: true,
                        workOrders: true,
                        quotes: true,
                        payments: true,
                        meetings: true,
                    },
                },
                sites: {
                    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
                    include: {
                        _count: {
                            select: {
                                equipment: true,
                                workOrders: true,
                            },
                        },
                    },
                },
                workOrders: {
                    orderBy: [{ scheduledAt: "desc" }, { updatedAt: "desc" }],
                    include: {
                        site: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
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
                    },
                },
                quotes: {
                    orderBy: [{ updatedAt: "desc" }],
                    take: 8,
                },
                payments: {
                    orderBy: [{ dueDate: "desc" }, { updatedAt: "desc" }],
                    take: 8,
                },
                meetings: {
                    orderBy: [{ dateTime: "desc" }, { updatedAt: "desc" }],
                    include: {
                        attachments: {
                            orderBy: { createdAt: "desc" },
                        },
                    },
                },
                documents: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
        const equipment = await this.prisma.installedDevice.findMany({
            where: {
                site: { customerId: id },
                inventoryMovements: {
                    some: {
                        workOrderId: { not: null },
                    },
                },
            },
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
        return {
            customer,
            sites: customer.sites,
            workOrders: customer.workOrders,
            equipment,
            quotes: customer.quotes,
            payments: customer.payments,
            meetings: customer.meetings,
            documents: customer.documents,
        };
    }
    async createDocument(customerId, dto) {
        await this.ensureExists(customerId);
        return this.prisma.customerDocument.create({
            data: {
                customerId,
                name: dto.name.trim(),
                mimeType: this.cleanOptional(dto.mimeType),
                size: dto.size,
                dataUrl: dto.dataUrl,
            },
        });
    }
    async deleteDocument(customerId, documentId) {
        await this.ensureExists(customerId);
        const document = await this.prisma.customerDocument.findFirst({
            where: {
                id: documentId,
                customerId,
            },
            select: {
                id: true,
            },
        });
        if (!document) {
            throw new common_1.NotFoundException("Customer document not found");
        }
        return this.prisma.customerDocument.delete({
            where: { id: documentId },
        });
    }
    async createSite(customerId, dto) {
        await this.ensureExists(customerId);
        const coordinates = this.normalizeCoordinates(dto.latitude, dto.longitude);
        return this.prisma.site.create({
            data: {
                customerId,
                name: dto.name.trim(),
                address: dto.address.trim(),
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                notes: this.cleanOptional(dto.notes),
            },
            include: {
                _count: {
                    select: {
                        equipment: true,
                        workOrders: true,
                    },
                },
            },
        });
    }
    async ensureExists(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
    }
    toCreateData(dto) {
        const coordinates = this.normalizeCoordinates(dto.latitude, dto.longitude);
        return {
            name: dto.name.trim(),
            legalName: this.cleanOptional(dto.legalName),
            taxId: this.cleanOptional(dto.taxId),
            email: this.cleanOptional(dto.email),
            phone: this.cleanOptional(dto.phone),
            address: this.cleanOptional(dto.address),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            logoUrl: this.cleanOptional(dto.logoUrl),
            type: dto.type,
            status: dto.status,
            notes: this.cleanOptional(dto.notes),
        };
    }
    async nextCustomerReference() {
        const latest = await this.prisma.customer.findFirst({
            where: {
                reference: {
                    startsWith: "CLI-",
                },
            },
            orderBy: {
                reference: "desc",
            },
            select: {
                reference: true,
            },
        });
        const latestNumber = Number(latest?.reference.replace("CLI-", "") ?? "0");
        const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;
        return `CLI-${String(nextNumber).padStart(4, "0")}`;
    }
    toUpdateData(dto) {
        const coordinates = this.normalizeCoordinates(dto.latitude, dto.longitude);
        return {
            name: this.cleanOptional(dto.name),
            legalName: this.cleanNullable(dto.legalName),
            taxId: this.cleanNullable(dto.taxId),
            email: this.cleanNullable(dto.email),
            phone: this.cleanNullable(dto.phone),
            address: this.cleanNullable(dto.address),
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            logoUrl: this.cleanNullable(dto.logoUrl),
            type: dto.type,
            status: dto.status,
            notes: this.cleanNullable(dto.notes),
        };
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
    normalizeCoordinates(latitude, longitude) {
        const normalizedLatitude = this.normalizePackedUruguayCoordinate(latitude, "latitude");
        const normalizedLongitude = this.normalizePackedUruguayCoordinate(longitude, "longitude");
        if (normalizedLatitude === undefined && normalizedLongitude === undefined) {
            return { latitude: undefined, longitude: undefined };
        }
        if (normalizedLatitude === undefined ||
            normalizedLongitude === undefined ||
            !this.isValidLatitude(normalizedLatitude) ||
            !this.isValidLongitude(normalizedLongitude) ||
            !this.isUruguayCoordinate(normalizedLatitude, normalizedLongitude)) {
            return { latitude: null, longitude: null };
        }
        return { latitude: normalizedLatitude, longitude: normalizedLongitude };
    }
    normalizePackedUruguayCoordinate(value, kind) {
        if (value === undefined || value === null || value === 0 || !Number.isFinite(value)) {
            return undefined;
        }
        if (kind === "latitude" && Math.abs(value) <= 90) {
            return value;
        }
        if (kind === "longitude" && Math.abs(value) <= 180) {
            return value;
        }
        const sign = value < 0 ? -1 : 1;
        const digits = String(Math.trunc(Math.abs(value)));
        const expectedPrefix = kind === "latitude" ? "34" : "56";
        if (digits.startsWith(expectedPrefix) && digits.length > 2) {
            return sign * (Number(digits.slice(0, 2)) + Number(`0.${digits.slice(2)}`));
        }
        return value;
    }
    isValidLatitude(value) {
        return Number.isFinite(value) && value >= -90 && value <= 90;
    }
    isValidLongitude(value) {
        return Number.isFinite(value) && value >= -180 && value <= 180;
    }
    isUruguayCoordinate(latitude, longitude) {
        return latitude >= -35.2 && latitude <= -30 && longitude >= -58.6 && longitude <= -53;
    }
    cleanNullable(value) {
        if (value === undefined) {
            return undefined;
        }
        const clean = value.trim();
        return clean ? clean : null;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map