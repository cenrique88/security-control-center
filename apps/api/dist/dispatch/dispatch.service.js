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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const vehicles_service_1 = require("../vehicles/vehicles.service");
const save_dispatch_stops_dto_1 = require("./dto/save-dispatch-stops.dto");
let DispatchService = class DispatchService {
    prisma;
    vehiclesService;
    config;
    constructor(prisma, vehiclesService, config) {
        this.prisma = prisma;
        this.vehiclesService = vehiclesService;
        this.config = config;
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
        const saved = await this.prisma.$transaction(async (tx) => {
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
        return this.syncSavedStopGeofences(saved);
    }
    async syncTraccar(date, vehicleId) {
        if (!vehicleId) {
            throw new common_1.BadRequestException("Selecciona un vehiculo para sincronizar Traccar.");
        }
        const report = await this.vehiclesService.traccarNativeStopsReport(vehicleId, date);
        if (!report.configured) {
            return {
                configured: false,
                saved: [],
                message: report.message || "Configura Traccar y vincula el ID del dispositivo.",
                summary: report,
            };
        }
        const summary = report.stops.length ? report : await this.vehiclesService.traccarDailySummary(vehicleId, date);
        const stops = await this.buildTraccarDispatchStops(summary);
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
    async buildTraccarDispatchStops(summary) {
        const visitsByStop = new Map(summary.visits.map((visit) => [visit.stopIndex, visit]));
        const stops = await Promise.all(summary.stops
            .map(async (stop) => {
            const visit = visitsByStop.get(stop.index);
            const googlePlace = visit ? null : await this.identifyGooglePlace(stop.latitude, stop.longitude);
            const previousStop = stop.index > 0 ? summary.stops[stop.index - 1] : null;
            const origin = previousStop ? `Parada ${previousStop.index + 1}` : "Base";
            const placeType = visit?.customerType === "IMPORTER"
                ? save_dispatch_stops_dto_1.DispatchPlaceTypeDto.IMPORTER
                : visit
                    ? save_dispatch_stops_dto_1.DispatchPlaceTypeDto.CLIENT
                    : googlePlace?.placeType
                        ? googlePlace.placeType
                        : save_dispatch_stops_dto_1.DispatchPlaceTypeDto.OTHER;
            const title = visit
                ? `${visit.customerName}${visit.siteName ? ` - ${visit.siteName}` : ""}`
                : googlePlace?.title
                    ? googlePlace.title
                    : `Parada GPS ${stop.index + 1}`;
            return {
                stopKey: `gps-${stop.index}`,
                placeType,
                title,
                address: visit?.address || googlePlace?.address || stop.address,
                latitude: stop.latitude,
                longitude: stop.longitude,
                customerId: visit?.customerId,
                siteId: visit?.siteId,
                supplierName: visit?.customerType === "IMPORTER" ? visit.customerName : undefined,
                kind: visit ? "CLIENT" : googlePlace?.kind ?? "NOT_CLIENT",
                scheduledAt: stop.arrival,
                durationMinutes: stop.durationMinutes,
                parkingCost: 0,
                tollCost: 0,
                notes: [
                    `Trayecto: salida ${this.formatStopTime(previousStop?.departure || summary.date)} desde ${origin}; llegada ${this.formatStopTime(stop.arrival)} a ${title}.`,
                    visit?.match
                        ? `Coincidencia ${visit.match}${visit.distanceMeters !== undefined ? ` a ${visit.distanceMeters} m` : ""}.`
                        : googlePlace?.notes,
                ].filter(Boolean).join(" "),
                source: "TRACCAR",
            };
        }));
        return stops;
    }
    async identifyGooglePlace(latitude, longitude) {
        const knownPlace = this.findKnownPublicPlace(latitude, longitude);
        if (knownPlace) {
            return knownPlace;
        }
        const key = this.config.get("GOOGLE_MAPS_API_KEY") || process.env.GOOGLE_MAPS_API_KEY;
        if (!key) {
            return null;
        }
        const place = await this.findNearbyGooglePlace(latitude, longitude, key);
        if (place) {
            return this.toGooglePlaceIdentification(place);
        }
        const textPlace = await this.findTextGooglePlace(latitude, longitude, key);
        if (textPlace) {
            return this.toGooglePlaceIdentification(textPlace, "Identificado automaticamente con Google Maps por busqueda de comercio cercano.");
        }
        const address = await this.reverseGoogleAddress(latitude, longitude, key);
        if (address) {
            return {
                title: "Residencia / domicilio",
                address,
                placeType: save_dispatch_stops_dto_1.DispatchPlaceTypeDto.OTHER,
                kind: "NOT_CLIENT",
                notes: "Google Maps no detecto local cercano; marcado como residencia o domicilio por direccion.",
            };
        }
        return null;
    }
    findKnownPublicPlace(latitude, longitude) {
        const knownPlaces = [
            {
                title: "Super Los 33",
                address: "Camino Carrasco, Montevideo, Montevideo, UY",
                latitude: -34.8715622,
                longitude: -56.11696,
                radiusMeters: 120,
            },
        ];
        const match = knownPlaces.find((place) => {
            const distanceMeters = this.haversineKm(latitude, longitude, place.latitude, place.longitude) * 1000;
            return distanceMeters <= place.radiusMeters;
        });
        if (!match) {
            return null;
        }
        return {
            title: match.title,
            address: match.address,
            placeType: save_dispatch_stops_dto_1.DispatchPlaceTypeDto.OTHER,
            kind: "NOT_CLIENT",
            notes: "Identificado por punto publico conocido cercano al GPS.",
        };
    }
    toGooglePlaceIdentification(place, note = "Identificado automaticamente con Google Maps como local o punto de interes.") {
        const name = place.displayName?.text?.trim();
        if (!name) {
            return null;
        }
        return {
            title: name,
            address: place.formattedAddress,
            placeType: save_dispatch_stops_dto_1.DispatchPlaceTypeDto.OTHER,
            kind: "NOT_CLIENT",
            notes: [
                note,
                place.types?.length ? `Tipos: ${place.types.slice(0, 5).join(", ")}` : "",
            ]
                .filter(Boolean)
                .join(" "),
        };
    }
    async findNearbyGooglePlace(latitude, longitude, key) {
        try {
            const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": key,
                    "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.types",
                },
                body: JSON.stringify({
                    maxResultCount: 5,
                    rankPreference: "DISTANCE",
                    locationRestriction: {
                        circle: {
                            center: { latitude, longitude },
                            radius: 120,
                        },
                    },
                    languageCode: "es-419",
                    regionCode: "UY",
                }),
            });
            if (!response.ok) {
                return null;
            }
            const data = (await response.json());
            return data.places?.find((place) => {
                if (!place.location?.latitude || !place.location?.longitude) {
                    return Boolean(place.displayName?.text);
                }
                const distanceMeters = this.haversineKm(latitude, longitude, place.location.latitude, place.location.longitude) * 1000;
                return distanceMeters <= 100 && Boolean(place.displayName?.text);
            }) ?? null;
        }
        catch {
            return null;
        }
    }
    async findTextGooglePlace(latitude, longitude, key) {
        const queries = ["supermercado", "autoservicio", "almacen", "comercio", "tienda"];
        for (const textQuery of queries) {
            try {
                const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": key,
                        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.types",
                    },
                    body: JSON.stringify({
                        textQuery,
                        maxResultCount: 5,
                        locationBias: {
                            circle: {
                                center: { latitude, longitude },
                                radius: 180,
                            },
                        },
                        languageCode: "es-419",
                        regionCode: "UY",
                    }),
                });
                if (!response.ok) {
                    continue;
                }
                const data = (await response.json());
                const place = data.places?.find((candidate) => {
                    if (!candidate.location?.latitude || !candidate.location?.longitude) {
                        return Boolean(candidate.displayName?.text);
                    }
                    const distanceMeters = this.haversineKm(latitude, longitude, candidate.location.latitude, candidate.location.longitude) * 1000;
                    return distanceMeters <= 160 && Boolean(candidate.displayName?.text);
                });
                if (place) {
                    return place;
                }
            }
            catch {
                continue;
            }
        }
        return null;
    }
    async reverseGoogleAddress(latitude, longitude, key) {
        try {
            const params = new URLSearchParams({
                latlng: `${latitude},${longitude}`,
                key,
                language: "es-419",
                region: "uy",
                result_type: "street_address|premise|subpremise",
            });
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
            if (!response.ok) {
                return null;
            }
            const data = (await response.json());
            if (data.status !== "OK") {
                return null;
            }
            return data.results?.[0]?.formatted_address?.trim() || null;
        }
        catch {
            return null;
        }
    }
    haversineKm(lat1, lon1, lat2, lon2) {
        const radius = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    deg2rad(value) {
        return value * (Math.PI / 180);
    }
    formatStopTime(value) {
        if (!value) {
            return "sin hora";
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "sin hora";
        }
        return date.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
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
    async syncSavedStopGeofences(stops) {
        const synced = [];
        for (const stop of stops) {
            if (!this.shouldCreateDispatchGeofence(stop)) {
                synced.push(stop);
                continue;
            }
            try {
                const result = await this.vehiclesService.syncDispatchStopGeofence(stop);
                if (result.configured && (result.status === "created" || result.status === "updated")) {
                    synced.push(await this.prisma.dispatchStop.update({
                        where: { id: stop.id },
                        data: { traccarGeofenceId: result.geofenceId },
                    }));
                    continue;
                }
            }
            catch (error) {
                console.warn(`No se pudo crear geozona de la parada ${stop.id}: ${error instanceof Error ? error.message : String(error)}`);
            }
            synced.push(stop);
        }
        return synced;
    }
    shouldCreateDispatchGeofence(stop) {
        const latitude = Number(stop.latitude);
        const longitude = Number(stop.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return false;
        }
        if (stop.placeType === "TRANSFER" || stop.kind === "TRANSFER") {
            return false;
        }
        const title = stop.title.trim().toLowerCase();
        if (title.includes("regreso") || title.includes("cierre")) {
            return false;
        }
        return Boolean(stop.notes?.trim() || stop.futureClientName?.trim() || stop.supplierName?.trim() || stop.placeType === "OTHER" || stop.placeType === "FUTURE_CLIENT");
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
        vehicles_service_1.VehiclesService,
        config_1.ConfigService])
], DispatchService);
//# sourceMappingURL=dispatch.service.js.map