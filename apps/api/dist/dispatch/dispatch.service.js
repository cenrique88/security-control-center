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
exports.DispatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const vehicles_service_1 = require("../vehicles/vehicles.service");
const save_dispatch_stops_dto_1 = require("./dto/save-dispatch-stops.dto");
let DispatchService = class DispatchService {
    prisma;
    vehiclesService;
    constructor(prisma, vehiclesService) {
        this.prisma = prisma;
        this.vehiclesService = vehiclesService;
    }
    async list(date, vehicleId) {
        const day = this.parseDay(date);
        const vehicleKey = vehicleId || "unassigned";
        return this.prisma.dispatchStop.findMany({
            where: {
                date: day,
                vehicleKey,
            },
            orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
        });
    }
    async save(dto) {
        const day = this.parseDay(dto.date);
        const vehicleId = dto.vehicleId || null;
        const vehicleKey = dto.vehicleId || "unassigned";
        return this.prisma.$transaction(async (tx) => {
            const saved = [];
            for (const stop of dto.stops) {
                saved.push(await tx.dispatchStop.upsert({
                    where: {
                        date_vehicleKey_stopKey: {
                            date: day,
                            vehicleKey,
                            stopKey: stop.stopKey,
                        },
                    },
                    create: {
                        date: day,
                        vehicleId,
                        vehicleKey,
                        stopKey: stop.stopKey,
                        ...this.toStopData(stop),
                    },
                    update: this.toStopData(stop),
                }));
            }
            return saved;
        });
    }
    async syncTraccar(date, vehicleId) {
        if (!vehicleId) {
            throw new common_1.BadRequestException("Selecciona un vehiculo para sincronizar Traccar.");
        }
        const summary = await this.vehiclesService.traccarDailySummary(vehicleId, date);
        if (!summary.configured) {
            return {
                configured: false,
                saved: [],
                message: summary.message || "Configura Traccar y vincula el ID del dispositivo.",
                summary,
            };
        }
        const stops = this.buildTraccarDispatchStops(summary);
        if (!stops.length) {
            return {
                configured: true,
                saved: [],
                message: "Traccar no devolvio paradas para sincronizar en esta fecha.",
                summary,
            };
        }
        const saved = await this.save({
            date,
            vehicleId,
            stops,
        });
        return {
            configured: true,
            saved,
            message: `Despachador sincronizado con Traccar: ${saved.length} paradas guardadas.`,
            summary,
        };
    }
    async suppliers() {
        const [inventorySuppliers, importerCustomers] = await Promise.all([
            this.prisma.inventoryItem.findMany({
                where: {
                    supplier: {
                        not: null,
                    },
                },
                select: {
                    supplier: true,
                },
                distinct: ["supplier"],
                orderBy: {
                    supplier: "asc",
                },
            }),
            this.prisma.customer.findMany({
                where: {
                    type: "IMPORTER",
                },
                select: {
                    name: true,
                },
                orderBy: {
                    name: "asc",
                },
            }),
        ]);
        return Array.from(new Set([
            ...importerCustomers.map((customer) => customer.name),
            ...inventorySuppliers.map((row) => row.supplier).filter((supplier) => Boolean(supplier)),
        ])).sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
    }
    async places() {
        const [savedStops, customers] = await Promise.all([
            this.prisma.dispatchStop.findMany({
                where: {
                    latitude: {
                        not: null,
                    },
                    longitude: {
                        not: null,
                    },
                    OR: [
                        {
                            source: "TRACCAR",
                        },
                        {
                            source: "CRM",
                        },
                    ],
                },
                orderBy: {
                    updatedAt: "desc",
                },
                take: 500,
            }),
            this.prisma.customer.findMany({
                where: {
                    latitude: {
                        not: null,
                    },
                    longitude: {
                        not: null,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    address: true,
                    latitude: true,
                    longitude: true,
                    type: true,
                    updatedAt: true,
                },
                orderBy: {
                    name: "asc",
                },
            }),
        ]);
        const customerPlaces = customers.map((customer) => ({
            id: `customer-${customer.id}`,
            date: new Date(0),
            vehicleId: null,
            vehicleKey: "directory",
            stopKey: `customer-${customer.id}`,
            placeType: customer.type === "IMPORTER" ? "IMPORTER" : "CLIENT",
            title: customer.name,
            address: customer.address,
            latitude: customer.latitude,
            longitude: customer.longitude,
            customerId: customer.id,
            siteId: null,
            workOrderId: null,
            supplierName: customer.type === "IMPORTER" ? customer.name : null,
            futureClientName: null,
            kind: customer.type === "IMPORTER" ? "IMPORTER" : "CLIENT",
            zone: null,
            scheduledAt: null,
            durationMinutes: 0,
            parkingCost: 0,
            tollCost: 0,
            notes: customer.type === "IMPORTER" ? "Importador registrado en clientes" : "Cliente registrado",
            source: "CRM",
            createdAt: customer.updatedAt,
            updatedAt: customer.updatedAt,
        }));
        return [...savedStops, ...customerPlaces].slice(0, 1000);
    }
    buildTraccarDispatchStops(summary) {
        const visitsByStop = new Map(summary.visits.map((visit) => [visit.stopIndex, visit]));
        const stops = summary.stops
            .filter((stop) => stop.durationMinutes >= 5)
            .map((stop) => {
            const visit = visitsByStop.get(stop.index);
            const placeType = visit?.customerType === "IMPORTER"
                ? save_dispatch_stops_dto_1.DispatchPlaceTypeDto.IMPORTER
                : visit
                    ? save_dispatch_stops_dto_1.DispatchPlaceTypeDto.CLIENT
                    : save_dispatch_stops_dto_1.DispatchPlaceTypeDto.OTHER;
            const title = visit
                ? `${visit.customerName}${visit.siteName ? ` - ${visit.siteName}` : ""}`
                : `Parada GPS ${stop.index + 1}`;
            return {
                stopKey: `gps-${stop.index}`,
                placeType,
                title,
                address: visit?.address || stop.address,
                latitude: stop.latitude,
                longitude: stop.longitude,
                customerId: visit?.customerId,
                siteId: visit?.siteId,
                supplierName: visit?.customerType === "IMPORTER" ? visit.customerName : undefined,
                kind: visit ? "CLIENT" : "NOT_CLIENT",
                scheduledAt: stop.arrival,
                durationMinutes: stop.durationMinutes,
                parkingCost: 0,
                tollCost: 0,
                notes: visit?.match ? `Coincidencia ${visit.match}${visit.distanceMeters !== undefined ? ` a ${visit.distanceMeters} m` : ""}` : undefined,
                source: "TRACCAR",
            };
        });
        return stops;
    }
    toStopData(stop) {
        return {
            placeType: (stop.placeType ?? "CLIENT"),
            title: stop.title.trim(),
            address: this.cleanNullable(stop.address),
            latitude: stop.latitude,
            longitude: stop.longitude,
            customerId: this.cleanNullable(stop.customerId),
            siteId: this.cleanNullable(stop.siteId),
            workOrderId: this.cleanNullable(stop.workOrderId),
            supplierName: this.cleanNullable(stop.supplierName),
            futureClientName: this.cleanNullable(stop.futureClientName),
            kind: this.cleanNullable(stop.kind),
            zone: this.cleanNullable(stop.zone),
            scheduledAt: stop.scheduledAt ? new Date(stop.scheduledAt) : null,
            durationMinutes: Math.max(0, Number(stop.durationMinutes) || 0),
            parkingCost: Math.max(0, Number(stop.parkingCost) || 0),
            tollCost: Math.max(0, Number(stop.tollCost) || 0),
            notes: this.cleanNullable(stop.notes),
            source: this.cleanNullable(stop.source) ?? "CRM",
        };
    }
    parseDay(date) {
        const day = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00.000`) : new Date(date);
        day.setHours(0, 0, 0, 0);
        return day;
    }
    cleanNullable(value) {
        const clean = value?.trim();
        return clean ? clean : null;
    }
};
exports.DispatchService = DispatchService;
exports.DispatchService = DispatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vehicles_service_1.VehiclesService])
], DispatchService);
//# sourceMappingURL=dispatch.service.js.map