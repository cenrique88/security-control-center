import { BadRequestException, Injectable } from "@nestjs/common";
import { DispatchPlaceType } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { VehiclesService } from "../vehicles/vehicles.service";
import { DispatchPlaceTypeDto, SaveDispatchStopsDto } from "./dto/save-dispatch-stops.dto";

type GooglePlaceCandidate = {
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
};

type GooglePlaceIdentification = {
  title: string;
  address?: string;
  placeType: DispatchPlaceTypeDto;
  kind: string;
  notes: string;
};

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
    private readonly config: ConfigService,
  ) {}

  async list(date: string, vehicleId?: string) {
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

  async save(dto: SaveDispatchStopsDto) {
    const day = this.parseDay(dto.date);
    const vehicleId = dto.vehicleId || null;
    const vehicleKey = dto.vehicleId || "unassigned";

    return this.prisma.$transaction(async (tx) => {
      const saved = [];
      for (const stop of dto.stops) {
        saved.push(
          await tx.dispatchStop.upsert({
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
          }),
        );
      }

      return saved;
    });
  }

  async syncTraccar(date: string, vehicleId?: string) {
    if (!vehicleId) {
      throw new BadRequestException("Selecciona un vehiculo para sincronizar Traccar.");
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

    return Array.from(
      new Set([
        ...importerCustomers.map((customer) => customer.name),
        ...inventorySuppliers.map((row) => row.supplier).filter((supplier): supplier is string => Boolean(supplier)),
      ]),
    ).sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
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

  private async buildTraccarDispatchStops(summary: Awaited<ReturnType<VehiclesService["traccarDailySummary"]>>) {
    const visitsByStop = new Map(summary.visits.map((visit) => [visit.stopIndex, visit]));

    const stops = await Promise.all(summary.stops
      .filter((stop) => stop.durationMinutes >= 5)
      .map(async (stop) => {
        const visit = visitsByStop.get(stop.index);
        const googlePlace = visit ? null : await this.identifyGooglePlace(stop.latitude, stop.longitude);
        const placeType =
          visit?.customerType === "IMPORTER"
            ? DispatchPlaceTypeDto.IMPORTER
            : visit
              ? DispatchPlaceTypeDto.CLIENT
              : googlePlace?.placeType
                ? googlePlace.placeType
              : DispatchPlaceTypeDto.OTHER;
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
          notes: visit?.match
            ? `Coincidencia ${visit.match}${visit.distanceMeters !== undefined ? ` a ${visit.distanceMeters} m` : ""}`
            : googlePlace?.notes,
          source: "TRACCAR",
        };
      }));

    return stops;
  }

  private async identifyGooglePlace(latitude: number, longitude: number): Promise<GooglePlaceIdentification | null> {
    const key = this.config.get<string>("GOOGLE_MAPS_API_KEY") || process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      return null;
    }

    const place = await this.findNearbyGooglePlace(latitude, longitude, key);
    if (place) {
      const name = place.displayName?.text?.trim();
      if (name) {
        return {
          title: name,
          address: place.formattedAddress,
          placeType: DispatchPlaceTypeDto.OTHER,
          kind: "NOT_CLIENT",
          notes: [
            "Identificado automaticamente con Google Maps como local o punto de interes.",
            place.types?.length ? `Tipos: ${place.types.slice(0, 5).join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" "),
        };
      }
    }

    const address = await this.reverseGoogleAddress(latitude, longitude, key);
    if (address) {
      return {
        title: "Residencia / domicilio",
        address,
        placeType: DispatchPlaceTypeDto.OTHER,
        kind: "NOT_CLIENT",
        notes: "Google Maps no detecto local cercano; marcado como residencia o domicilio por direccion.",
      };
    }

    return null;
  }

  private async findNearbyGooglePlace(latitude: number, longitude: number, key: string) {
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
              radius: 45,
            },
          },
          languageCode: "es-419",
          regionCode: "UY",
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { places?: GooglePlaceCandidate[] };
      return data.places?.find((place) => {
        if (!place.location?.latitude || !place.location?.longitude) {
          return Boolean(place.displayName?.text);
        }
        const distanceMeters = this.haversineKm(latitude, longitude, place.location.latitude, place.location.longitude) * 1000;
        return distanceMeters <= 55 && Boolean(place.displayName?.text);
      }) ?? null;
    } catch {
      return null;
    }
  }

  private async reverseGoogleAddress(latitude: number, longitude: number, key: string) {
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
      const data = (await response.json()) as { status?: string; results?: Array<{ formatted_address?: string }> };
      if (data.status !== "OK") {
        return null;
      }
      return data.results?.[0]?.formatted_address?.trim() || null;
    } catch {
      return null;
    }
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const radius = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private deg2rad(value: number) {
    return value * (Math.PI / 180);
  }

  private toStopData(stop: SaveDispatchStopsDto["stops"][number]) {
    return {
      placeType: (stop.placeType ?? "CLIENT") as DispatchPlaceType,
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

  private parseDay(date: string) {
    const day = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00.000`) : new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
  }

  private cleanNullable(value?: string | null) {
    const clean = value?.trim();
    return clean ? clean : null;
  }
}
