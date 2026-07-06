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
let DispatchService = class DispatchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
    async suppliers() {
        const rows = await this.prisma.inventoryItem.findMany({
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
        });
        return rows.map((row) => row.supplier).filter(Boolean);
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DispatchService);
//# sourceMappingURL=dispatch.service.js.map