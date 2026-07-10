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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const fuel_service_1 = require("../fuel/fuel.service");
const prisma_service_1 = require("../prisma/prisma.service");
const MOVEMENT_SPEED_THRESHOLD_KMH = 5;
let VehiclesService = class VehiclesService {
    prisma;
    fuelService;
    constructor(prisma, fuelService) {
        this.prisma = prisma;
        this.fuelService = fuelService;
    }
    async list(filters) {
        const where = {};
        if (filters.active !== undefined) {
            where.active = filters.active;
        }
        if (filters.search?.trim()) {
            const query = filters.search.trim();
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { plate: { contains: query, mode: "insensitive" } },
                { traccarDeviceId: { contains: query, mode: "insensitive" } },
            ];
        }
        return this.prisma.vehicle.findMany({
            where,
            orderBy: [{ active: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
        });
    }
    async create(dto) {
        return this.prisma.vehicle.create({
            data: {
                name: dto.name.trim(),
                plate: this.cleanOptional(dto.plate),
                traccarDeviceId: this.cleanOptional(dto.traccarDeviceId),
                fuelKmPerLiter: dto.fuelKmPerLiter,
                active: dto.active ?? true,
            },
        });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.vehicle.update({
            where: { id },
            data: {
                name: this.cleanOptional(dto.name),
                plate: this.cleanNullable(dto.plate),
                traccarDeviceId: this.cleanNullable(dto.traccarDeviceId),
                fuelKmPerLiter: dto.fuelKmPerLiter,
                active: dto.active,
            },
        });
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
    async getTraccarSettings() {
        const settings = await this.prisma.traccarSettings.upsert({
            where: { id: "default" },
            update: {},
            create: { id: "default" },
        });
        return {
            ...settings,
            token: settings.token ? "********" : "",
            password: settings.password ? "********" : "",
            configured: Boolean(settings.baseUrl && (settings.token || (settings.username && settings.password))),
        };
    }
    async updateTraccarSettings(dto) {
        const current = await this.prisma.traccarSettings.upsert({
            where: { id: "default" },
            update: {},
            create: { id: "default" },
        });
        const companyCoordinates = this.normalizeCompanyCoordinates(dto.companyLatitude, dto.companyLongitude);
        const data = {
            baseUrl: this.cleanNullable(dto.baseUrl),
            token: dto.token === "********" ? current.token : this.cleanNullable(dto.token),
            username: this.cleanNullable(dto.username),
            password: dto.password === "********" ? current.password : this.cleanNullable(dto.password),
            matchRadiusMeters: dto.matchRadiusMeters,
            minStopMinutes: dto.minStopMinutes,
            companyName: this.cleanOptional(dto.companyName) ?? "Security Solutions",
            companyAddress: this.cleanNullable(dto.companyAddress),
            companyLatitude: companyCoordinates.latitude,
            companyLongitude: companyCoordinates.longitude,
        };
        const settings = await this.prisma.traccarSettings.update({
            where: { id: "default" },
            data,
        });
        return {
            ...settings,
            token: settings.token ? "********" : "",
            password: settings.password ? "********" : "",
            configured: Boolean(settings.baseUrl && (settings.token || (settings.username && settings.password))),
        };
    }
    async traccarDailySummary(id, date) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehicle not found");
        }
        const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
        if (!settings?.baseUrl || !vehicle.traccarDeviceId) {
            return this.emptyDailySummary(vehicle, date, "Configura Traccar y vincula el ID del dispositivo.");
        }
        const day = this.parseReportDate(date);
        const from = new Date(day);
        from.setHours(0, 0, 0, 0);
        const to = new Date(day);
        to.setHours(23, 59, 59, 999);
        let positions = [];
        try {
            positions = await this.fetchTraccarPositions(settings, vehicle.traccarDeviceId, from, to);
        }
        catch (error) {
            return this.emptyDailySummary(vehicle, date, error instanceof Error ? error.message : "No se pudo consultar Traccar.");
        }
        const sorted = positions
            .filter((position) => Number.isFinite(position.latitude) && Number.isFinite(position.longitude))
            .sort((left, right) => this.positionTime(left).getTime() - this.positionTime(right).getTime());
        const distanceKm = this.roundNumber(this.calculateMovingDistanceKm(sorted), 2);
        const stops = this.detectStops(sorted, settings.minStopMinutes, MOVEMENT_SPEED_THRESHOLD_KMH);
        const visits = await this.detectCustomerVisits(stops, settings.matchRadiusMeters);
        const movingMinutes = Math.round(this.calculateMovingMinutes(sorted, MOVEMENT_SPEED_THRESHOLD_KMH));
        const speedStats = this.calculateSpeedStats(sorted, MOVEMENT_SPEED_THRESHOLD_KMH);
        const fuelKmPerLiter = Number(vehicle.fuelKmPerLiter) || 10;
        const estimatedLiters = fuelKmPerLiter > 0 ? this.roundNumber(distanceKm / fuelKmPerLiter, 2) : 0;
        const fuel = await this.fuelService.getUruguaySuperPrice();
        const estimatedFuelCost = this.roundNumber(estimatedLiters * fuel.pricePerLiter, 2);
        return {
            vehicle,
            date: from.toISOString().slice(0, 10),
            configured: true,
            positions: sorted.length,
            distanceKm,
            movingMinutes,
            stoppedMinutes: stops.reduce((sum, stop) => sum + stop.durationMinutes, 0),
            minSpeedKmh: speedStats.minSpeedKmh,
            averageSpeedKmh: speedStats.averageSpeedKmh,
            maxSpeedKmh: speedStats.maxSpeedKmh,
            estimatedLiters,
            fuelPricePerLiter: fuel.pricePerLiter,
            estimatedFuelCost,
            stops,
            visits,
            unmatchedStops: stops.filter((stop) => !visits.some((visit) => visit.stopIndex === stop.index)),
            message: sorted.length ? "" : "Traccar no devolvio posiciones para ese dia.",
        };
    }
    async syncCustomerGeofences() {
        const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
        if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
            return {
                configured: false,
                created: 0,
                updated: 0,
                linked: 0,
                skipped: 0,
                items: [],
                message: "Configura Traccar antes de sincronizar geozonas.",
            };
        }
        const radius = settings.matchRadiusMeters || 120;
        const vehicles = await this.prisma.vehicle.findMany({
            where: { active: true, traccarDeviceId: { not: null } },
            select: { traccarDeviceId: true },
        });
        const customers = await this.prisma.customer.findMany({
            orderBy: { name: "asc" },
            include: { sites: { orderBy: { name: "asc" } } },
        });
        const items = [];
        let created = 0;
        let updated = 0;
        let linked = 0;
        let skipped = 0;
        for (const customer of customers) {
            const customerCoords = this.resolveCoordinates(customer.latitude, customer.longitude, customer.address);
            if (customerCoords) {
                const result = await this.upsertTraccarGeofence(settings, {
                    currentId: customer.traccarGeofenceId,
                    name: `CRM Cliente - ${customer.name}`,
                    description: customer.address ?? "",
                    latitude: customerCoords.latitude,
                    longitude: customerCoords.longitude,
                    radius,
                });
                if (result.status === "created" || result.status === "updated") {
                    await this.prisma.customer.update({
                        where: { id: customer.id },
                        data: {
                            latitude: customerCoords.latitude,
                            longitude: customerCoords.longitude,
                            traccarGeofenceId: result.geofenceId,
                        },
                    });
                    const linkedCount = await this.linkGeofenceToVehicles(settings, result.geofenceId, vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean));
                    linked += linkedCount;
                    result.status === "created" ? (created += 1) : (updated += 1);
                }
                else {
                    skipped += 1;
                }
                items.push({ type: "Cliente", id: customer.id, name: customer.name, ...result });
            }
            else if (!customer.sites.length) {
                skipped += 1;
                items.push({ type: "Cliente", id: customer.id, name: customer.name, status: "skipped", reason: "Sin coordenadas" });
            }
            for (const site of customer.sites) {
                const coords = this.resolveCoordinates(site.latitude, site.longitude, site.address);
                if (!coords) {
                    skipped += 1;
                    items.push({ type: "Sitio", id: site.id, name: `${customer.name} - ${site.name}`, status: "skipped", reason: "Sin coordenadas" });
                    continue;
                }
                const result = await this.upsertTraccarGeofence(settings, {
                    currentId: site.traccarGeofenceId,
                    name: `CRM Sitio - ${customer.name} - ${site.name}`,
                    description: site.address,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    radius,
                });
                if (result.status === "created" || result.status === "updated") {
                    await this.prisma.site.update({
                        where: { id: site.id },
                        data: {
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            traccarGeofenceId: result.geofenceId,
                        },
                    });
                    const linkedCount = await this.linkGeofenceToVehicles(settings, result.geofenceId, vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean));
                    linked += linkedCount;
                    result.status === "created" ? (created += 1) : (updated += 1);
                }
                else {
                    skipped += 1;
                }
                items.push({ type: "Sitio", id: site.id, name: `${customer.name} - ${site.name}`, ...result });
            }
        }
        return {
            configured: true,
            created,
            updated,
            linked,
            skipped,
            items,
            message: `Geozonas sincronizadas: ${created} nuevas, ${updated} actualizadas, ${skipped} sin coordenadas.`,
        };
    }
    async syncCustomerGeofenceById(customerId) {
        const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
        if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
            return { configured: false, status: "skipped", reason: "Configura Traccar antes de sincronizar geozonas." };
        }
        const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
        const coords = this.resolveCoordinates(customer.latitude, customer.longitude, customer.address);
        if (!coords) {
            return { configured: true, status: "skipped", reason: "Sin coordenadas" };
        }
        const result = await this.upsertTraccarGeofence(settings, {
            currentId: customer.traccarGeofenceId,
            name: `CRM Cliente - ${customer.name}`,
            description: customer.address ?? "",
            latitude: coords.latitude,
            longitude: coords.longitude,
            radius: settings.matchRadiusMeters || 120,
        });
        if (result.status !== "created" && result.status !== "updated") {
            return { configured: true, ...result };
        }
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                traccarGeofenceId: result.geofenceId,
            },
        });
        const vehicles = await this.prisma.vehicle.findMany({
            where: { active: true, traccarDeviceId: { not: null } },
            select: { traccarDeviceId: true },
        });
        const linked = await this.linkGeofenceToVehicles(settings, result.geofenceId, vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean));
        return { configured: true, ...result, linked };
    }
    async syncSiteGeofenceById(siteId) {
        const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
        if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
            return { configured: false, status: "skipped", reason: "Configura Traccar antes de sincronizar geozonas." };
        }
        const site = await this.prisma.site.findUnique({
            where: { id: siteId },
            include: {
                customer: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (!site) {
            throw new common_1.NotFoundException("Site not found");
        }
        const coords = this.resolveCoordinates(site.latitude, site.longitude, site.address);
        if (!coords) {
            return { configured: true, status: "skipped", reason: "Sin coordenadas" };
        }
        const result = await this.upsertTraccarGeofence(settings, {
            currentId: site.traccarGeofenceId,
            name: `CRM Sitio - ${site.customer.name} - ${site.name}`,
            description: site.address,
            latitude: coords.latitude,
            longitude: coords.longitude,
            radius: settings.matchRadiusMeters || 120,
        });
        if (result.status !== "created" && result.status !== "updated") {
            return { configured: true, ...result };
        }
        await this.prisma.site.update({
            where: { id: site.id },
            data: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                traccarGeofenceId: result.geofenceId,
            },
        });
        const vehicles = await this.prisma.vehicle.findMany({
            where: { active: true, traccarDeviceId: { not: null } },
            select: { traccarDeviceId: true },
        });
        const linked = await this.linkGeofenceToVehicles(settings, result.geofenceId, vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean));
        return { configured: true, ...result, linked };
    }
    async fetchTraccarPositions(settings, deviceId, from, to) {
        const baseUrl = settings.baseUrl?.replace(/\/+$/, "");
        if (!baseUrl) {
            throw new Error("Configura la URL de Traccar.");
        }
        const url = new URL(`${baseUrl}/api/positions`);
        url.searchParams.set("deviceId", deviceId);
        url.searchParams.set("from", from.toISOString());
        url.searchParams.set("to", to.toISOString());
        const headers = this.traccarHeaders(settings);
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Traccar respondio ${response.status}. Revisa URL, credenciales o ID del dispositivo.`);
        }
        return (await response.json());
    }
    async upsertTraccarGeofence(settings, geofence) {
        const body = {
            name: geofence.name.slice(0, 120),
            description: geofence.description,
            area: `CIRCLE (${geofence.latitude} ${geofence.longitude}, ${geofence.radius})`,
            attributes: {
                source: "security-control-center",
            },
        };
        if (geofence.currentId) {
            const update = await this.traccarRequest(settings, `/api/geofences/${geofence.currentId}`, {
                method: "PUT",
                body: JSON.stringify({ id: geofence.currentId, ...body }),
            });
            if (update.ok) {
                return { status: "updated", geofenceId: geofence.currentId };
            }
        }
        const create = await this.traccarRequest(settings, "/api/geofences", {
            method: "POST",
            body: JSON.stringify(body),
        });
        if (!create.ok) {
            return { status: "error", reason: `Traccar respondio ${create.status}` };
        }
        const data = (await create.json());
        return data.id ? { status: "created", geofenceId: data.id } : { status: "error", reason: "Traccar no devolvio ID" };
    }
    async linkGeofenceToVehicles(settings, geofenceId, deviceIds) {
        let linked = 0;
        for (const deviceId of deviceIds) {
            const response = await this.traccarRequest(settings, "/api/permissions", {
                method: "POST",
                body: JSON.stringify({ deviceId: Number(deviceId), geofenceId }),
            });
            if (response.ok || response.status === 400) {
                linked += 1;
            }
        }
        return linked;
    }
    traccarRequest(settings, path, init = {}) {
        const baseUrl = settings.baseUrl?.replace(/\/+$/, "");
        if (!baseUrl) {
            throw new Error("Configura la URL de Traccar.");
        }
        return fetch(`${baseUrl}${path}`, {
            ...init,
            headers: {
                ...this.traccarHeaders(settings),
                "Content-Type": "application/json",
                ...(init.headers ?? {}),
            },
        });
    }
    traccarHeaders(settings) {
        const headers = { Accept: "application/json" };
        if (settings.token) {
            headers.Authorization = `Bearer ${settings.token}`;
        }
        else if (settings.username && settings.password) {
            headers.Authorization = `Basic ${Buffer.from(`${settings.username}:${settings.password}`).toString("base64")}`;
        }
        return headers;
    }
    async detectCustomerVisits(stops, matchRadiusMeters) {
        const customers = await this.prisma.customer.findMany({
            include: { sites: true },
            orderBy: { name: "asc" },
        });
        const visits = [];
        stops.forEach((stop) => {
            let best = null;
            customers.forEach((customer) => {
                const customerLat = Number(customer.latitude);
                const customerLon = Number(customer.longitude);
                const hasCustomerCoords = Number.isFinite(customerLat) && Number.isFinite(customerLon);
                const customerDistanceMeters = hasCustomerCoords
                    ? this.haversineKm(stop.latitude, stop.longitude, customerLat, customerLon) * 1000
                    : undefined;
                const customerGpsMatch = customerDistanceMeters !== undefined && customerDistanceMeters <= matchRadiusMeters;
                const addressScore = this.matchesText(stop.address, customer.address);
                if (customerGpsMatch || addressScore || this.matchesText(stop.address, customer.name)) {
                    const candidate = {
                        stopIndex: stop.index,
                        customerId: customer.id,
                        customerName: customer.name,
                        customerType: customer.type,
                        address: customer.address ?? undefined,
                        arrival: stop.arrival,
                        departure: stop.departure,
                        durationMinutes: stop.durationMinutes,
                        match: customerGpsMatch ? "GPS" : addressScore ? "ADDRESS" : "NAME",
                        distanceMeters: customerDistanceMeters === undefined ? undefined : this.roundNumber(customerDistanceMeters, 0),
                    };
                    if (!best || (candidate.distanceMeters ?? Number.MAX_SAFE_INTEGER) < (best.distanceMeters ?? Number.MAX_SAFE_INTEGER)) {
                        best = candidate;
                    }
                }
                customer.sites.forEach((site) => {
                    const siteLat = Number(site.latitude);
                    const siteLon = Number(site.longitude);
                    const hasCoords = Number.isFinite(siteLat) && Number.isFinite(siteLon);
                    const distanceMeters = hasCoords ? this.haversineKm(stop.latitude, stop.longitude, siteLat, siteLon) * 1000 : undefined;
                    const gpsMatch = distanceMeters !== undefined && distanceMeters <= matchRadiusMeters;
                    const addressMatch = this.matchesText(stop.address, site.address) || this.matchesText(stop.address, site.name);
                    if (!gpsMatch && !addressMatch) {
                        return;
                    }
                    const candidate = {
                        stopIndex: stop.index,
                        customerId: customer.id,
                        customerName: customer.name,
                        customerType: customer.type,
                        siteId: site.id,
                        siteName: site.name,
                        address: site.address,
                        arrival: stop.arrival,
                        departure: stop.departure,
                        durationMinutes: stop.durationMinutes,
                        match: gpsMatch ? "GPS" : "ADDRESS",
                        distanceMeters: distanceMeters === undefined ? undefined : this.roundNumber(distanceMeters, 0),
                    };
                    if (!best || (candidate.distanceMeters ?? Number.MAX_SAFE_INTEGER) < (best.distanceMeters ?? Number.MAX_SAFE_INTEGER)) {
                        best = candidate;
                    }
                });
            });
            if (best) {
                visits.push(best);
            }
        });
        return visits;
    }
    detectStops(positions, minStopMinutes, speedThresholdKmh) {
        const stops = [];
        let stopStartIndex = null;
        for (let index = 1; index < positions.length; index += 1) {
            const previous = positions[index - 1];
            const current = positions[index];
            const moving = this.segmentSpeedKmh(previous, current) > speedThresholdKmh;
            if (!moving && stopStartIndex === null) {
                stopStartIndex = index - 1;
            }
            const closesStop = moving || index === positions.length - 1;
            if (stopStartIndex === null || !closesStop) {
                continue;
            }
            const startPosition = positions[stopStartIndex];
            const endPosition = moving ? previous : current;
            const durationMinutes = Math.round((this.positionTime(endPosition).getTime() - this.positionTime(startPosition).getTime()) / 60000);
            if (durationMinutes > minStopMinutes) {
                stops.push({
                    index: stops.length,
                    arrival: this.positionTime(startPosition).toISOString(),
                    departure: this.positionTime(endPosition).toISOString(),
                    durationMinutes,
                    latitude: startPosition.latitude,
                    longitude: startPosition.longitude,
                    address: endPosition.address || startPosition.address,
                });
            }
            stopStartIndex = null;
        }
        return stops;
    }
    calculateMovingDistanceKm(positions) {
        return positions.reduce((sum, position, index) => {
            if (index === 0) {
                return sum;
            }
            const previous = positions[index - 1];
            if (this.segmentSpeedKmh(previous, position) <= MOVEMENT_SPEED_THRESHOLD_KMH) {
                return sum;
            }
            return sum + this.haversineKm(previous.latitude, previous.longitude, position.latitude, position.longitude);
        }, 0);
    }
    calculateMovingMinutes(positions, speedThresholdKmh) {
        if (positions.length < 2) {
            return 0;
        }
        return positions.reduce((minutes, position, index) => {
            if (index === 0) {
                return minutes;
            }
            const previous = positions[index - 1];
            if (this.segmentSpeedKmh(previous, position) <= speedThresholdKmh) {
                return minutes;
            }
            const deltaMinutes = Math.max(0, (this.positionTime(position).getTime() - this.positionTime(previous).getTime()) / 60000);
            return minutes + deltaMinutes;
        }, 0);
    }
    calculateSpeedStats(positions, speedThresholdKmh) {
        const speeds = positions.map((position) => this.positionSpeedKmh(position));
        const movingSpeeds = speeds.filter((speed) => speed > speedThresholdKmh);
        return {
            minSpeedKmh: this.roundNumber(movingSpeeds.length ? Math.min(...movingSpeeds) : 0, 1),
            averageSpeedKmh: this.roundNumber(movingSpeeds.length ? movingSpeeds.reduce((sum, speed) => sum + speed, 0) / movingSpeeds.length : 0, 1),
            maxSpeedKmh: this.roundNumber(movingSpeeds.length ? Math.max(...movingSpeeds) : 0, 1),
        };
    }
    segmentSpeedKmh(previous, current) {
        const rawSpeed = Number(current.speed);
        if (Number.isFinite(rawSpeed)) {
            return rawSpeed * 1.852;
        }
        const minutes = (this.positionTime(current).getTime() - this.positionTime(previous).getTime()) / 60000;
        if (minutes <= 0) {
            return 0;
        }
        const distanceKm = this.haversineKm(previous.latitude, previous.longitude, current.latitude, current.longitude);
        return (distanceKm / minutes) * 60;
    }
    positionSpeedKmh(position) {
        const speed = Number(position.speed);
        return Number.isFinite(speed) ? speed * 1.852 : 0;
    }
    haversineKm(lat1, lon1, lat2, lon2) {
        const radius = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    toRadians(value) {
        return (value * Math.PI) / 180;
    }
    positionTime(position) {
        return new Date(position.fixTime || position.deviceTime || position.serverTime || Date.now());
    }
    matchesText(left, right) {
        const a = this.normalizeText(left);
        const b = this.normalizeText(right);
        return Boolean(a && b && (a.includes(b) || b.includes(a)));
    }
    resolveCoordinates(latitude, longitude, address) {
        const lat = Number(latitude);
        const lon = Number(longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
            return { latitude: lat, longitude: lon };
        }
        return this.parseCoordinatesFromText(address);
    }
    parseCoordinatesFromText(value) {
        const match = value?.match(/(-?\d{1,2}(?:[.,]\d+)?)[,\s]+(-?\d{1,3}(?:[.,]\d+)?)/);
        if (!match) {
            return null;
        }
        const latitude = Number(match[1].replace(",", "."));
        const longitude = Number(match[2].replace(",", "."));
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
        }
        return { latitude, longitude };
    }
    normalizeText(value) {
        return (value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }
    parseReportDate(date) {
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return new Date(`${date}T12:00:00`);
        }
        return new Date();
    }
    emptyDailySummary(vehicle, date, message = "") {
        const day = this.parseReportDate(date);
        return {
            vehicle,
            date: day.toISOString().slice(0, 10),
            configured: false,
            positions: 0,
            distanceKm: 0,
            movingMinutes: 0,
            stoppedMinutes: 0,
            maxSpeedKmh: 0,
            minSpeedKmh: 0,
            averageSpeedKmh: 0,
            estimatedLiters: 0,
            fuelPricePerLiter: 0,
            estimatedFuelCost: 0,
            stops: [],
            visits: [],
            unmatchedStops: [],
            message,
        };
    }
    roundNumber(value, decimals) {
        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor;
    }
    async ensureExists(id) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id }, select: { id: true } });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehicle not found");
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
    normalizeCompanyCoordinates(latitude, longitude) {
        const normalizedLatitude = this.normalizeCoordinate(latitude, "latitude");
        const normalizedLongitude = this.normalizeCoordinate(longitude, "longitude");
        if ((normalizedLatitude === undefined) !== (normalizedLongitude === undefined)) {
            throw new common_1.BadRequestException("Carga latitud y longitud de la base operativa.");
        }
        if (normalizedLatitude !== undefined &&
            normalizedLongitude !== undefined &&
            !this.isUruguayCoordinate(normalizedLatitude, normalizedLongitude)) {
            throw new common_1.BadRequestException("Las coordenadas de la base no parecen estar en Uruguay. Usa latitud -34.xxxxxx y longitud -56.xxxxxx.");
        }
        return {
            latitude: normalizedLatitude,
            longitude: normalizedLongitude,
        };
    }
    normalizeCoordinate(value, kind) {
        if (value === undefined || value === null || value === 0) {
            return undefined;
        }
        const normalized = this.normalizePackedUruguayCoordinate(value, kind);
        const isLatitude = kind === "latitude";
        const valid = isLatitude
            ? normalized >= -90 && normalized <= 90
            : normalized >= -180 && normalized <= 180;
        if (!Number.isFinite(normalized) || !valid) {
            throw new common_1.BadRequestException(isLatitude
                ? "Latitud invalida. Para Uruguay usa un valor similar a -34.870204."
                : "Longitud invalida. Para Uruguay usa un valor similar a -56.113255.");
        }
        return normalized;
    }
    normalizePackedUruguayCoordinate(value, kind) {
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
    isUruguayCoordinate(latitude, longitude) {
        return latitude >= -35.2 && latitude <= -30 && longitude >= -58.6 && longitude <= -53;
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fuel_service_1.FuelService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map