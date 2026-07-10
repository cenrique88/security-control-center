import { Prisma } from "@prisma/client";
import { FuelService } from "../fuel/fuel.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateTraccarSettingsDto } from "./dto/update-traccar-settings.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
type VehicleFilters = {
    search?: string;
    active?: boolean;
};
export declare class VehiclesService {
    private readonly prisma;
    private readonly fuelService;
    constructor(prisma: PrismaService, fuelService: FuelService);
    list(filters: VehicleFilters): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        traccarDeviceId: string | null;
        plate: string | null;
        fuelKmPerLiter: Prisma.Decimal | null;
        active: boolean;
    }[]>;
    create(dto: CreateVehicleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        traccarDeviceId: string | null;
        plate: string | null;
        fuelKmPerLiter: Prisma.Decimal | null;
        active: boolean;
    }>;
    update(id: string, dto: UpdateVehicleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        traccarDeviceId: string | null;
        plate: string | null;
        fuelKmPerLiter: Prisma.Decimal | null;
        active: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        traccarDeviceId: string | null;
        plate: string | null;
        fuelKmPerLiter: Prisma.Decimal | null;
        active: boolean;
    }>;
    getTraccarSettings(): Promise<{
        token: string;
        password: string;
        configured: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        baseUrl: string | null;
        username: string | null;
        matchRadiusMeters: number;
        minStopMinutes: number;
        companyName: string;
        companyAddress: string | null;
        companyLatitude: Prisma.Decimal | null;
        companyLongitude: Prisma.Decimal | null;
    }>;
    updateTraccarSettings(dto: UpdateTraccarSettingsDto): Promise<{
        token: string;
        password: string;
        configured: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        baseUrl: string | null;
        username: string | null;
        matchRadiusMeters: number;
        minStopMinutes: number;
        companyName: string;
        companyAddress: string | null;
        companyLatitude: Prisma.Decimal | null;
        companyLongitude: Prisma.Decimal | null;
    }>;
    traccarDailySummary(id: string, date?: string): Promise<{
        vehicle: unknown;
        date: string;
        configured: boolean;
        positions: number;
        distanceKm: number;
        movingMinutes: number;
        stoppedMinutes: number;
        maxSpeedKmh: number;
        minSpeedKmh: number;
        averageSpeedKmh: number;
        estimatedLiters: number;
        fuelPricePerLiter: number;
        estimatedFuelCost: number;
        stops: never[];
        visits: never[];
        unmatchedStops: never[];
        message: string;
    } | {
        vehicle: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            traccarDeviceId: string | null;
            plate: string | null;
            fuelKmPerLiter: Prisma.Decimal | null;
            active: boolean;
        };
        date: string;
        configured: boolean;
        positions: number;
        distanceKm: number;
        movingMinutes: number;
        stoppedMinutes: number;
        minSpeedKmh: number;
        averageSpeedKmh: number;
        maxSpeedKmh: number;
        estimatedLiters: number;
        fuelPricePerLiter: number;
        estimatedFuelCost: number;
        stops: {
            index: number;
            arrival: string;
            departure: string;
            durationMinutes: number;
            latitude: number;
            longitude: number;
            address?: string;
        }[];
        visits: {
            stopIndex: number;
            customerId: string;
            customerName: string;
            customerType?: string;
            siteId?: string;
            siteName?: string;
            address?: string;
            arrival: string;
            departure: string;
            durationMinutes: number;
            match: "GPS" | "ADDRESS" | "NAME";
            distanceMeters?: number;
        }[];
        unmatchedStops: {
            index: number;
            arrival: string;
            departure: string;
            durationMinutes: number;
            latitude: number;
            longitude: number;
            address?: string;
        }[];
        message: string;
    }>;
    syncCustomerGeofences(): Promise<{
        configured: boolean;
        created: number;
        updated: number;
        linked: number;
        skipped: number;
        items: {
            type: "Cliente" | "Sitio";
            id: string;
            name: string;
            status: "created" | "updated" | "skipped" | "error";
            reason?: string;
            geofenceId?: number;
        }[];
        message: string;
    }>;
    syncCustomerGeofenceById(customerId: string): Promise<{
        configured: boolean;
        status: "skipped";
        reason: string;
    } | {
        status: "error";
        reason: string;
        geofenceId?: undefined;
        configured: boolean;
    } | {
        linked: number;
        status: "updated";
        geofenceId: number;
        reason?: undefined;
        configured: boolean;
    } | {
        linked: number;
        status: "created";
        geofenceId: number;
        reason?: undefined;
        configured: boolean;
    }>;
    syncSiteGeofenceById(siteId: string): Promise<{
        configured: boolean;
        status: "skipped";
        reason: string;
    } | {
        status: "error";
        reason: string;
        geofenceId?: undefined;
        configured: boolean;
    } | {
        linked: number;
        status: "updated";
        geofenceId: number;
        reason?: undefined;
        configured: boolean;
    } | {
        linked: number;
        status: "created";
        geofenceId: number;
        reason?: undefined;
        configured: boolean;
    }>;
    private fetchTraccarPositions;
    private upsertTraccarGeofence;
    private linkGeofenceToVehicles;
    private traccarRequest;
    private traccarHeaders;
    private detectCustomerVisits;
    private detectStops;
    private calculateMovingDistanceKm;
    private calculateMovingMinutes;
    private calculateSpeedStats;
    private segmentSpeedKmh;
    private positionSpeedKmh;
    private haversineKm;
    private toRadians;
    private positionTime;
    private matchesText;
    private resolveCoordinates;
    private parseCoordinatesFromText;
    private normalizeText;
    private parseReportDate;
    private emptyDailySummary;
    private roundNumber;
    private ensureExists;
    private cleanOptional;
    private cleanNullable;
    private normalizeCompanyCoordinates;
    private normalizeCoordinate;
    private normalizePackedUruguayCoordinate;
    private isUruguayCoordinate;
}
export {};
