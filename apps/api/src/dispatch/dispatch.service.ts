import { BadRequestException, Injectable } from "@nestjs/common";
import { DispatchPlaceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { VehiclesService } from "../vehicles/vehicles.service";
import { DispatchPlaceTypeDto, SaveDispatchStopsDto } from "./dto/save-dispatch-stops.dto";

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vehiclesService: VehiclesService,
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

  private buildTraccarDispatchStops(summary: Awaited<ReturnType<VehiclesService["traccarDailySummary"]>>) {
    const visitsByStop = new Map(summary.visits.map((visit) => [visit.stopIndex, visit]));

    const stops: SaveDispatchStopsDto["stops"] = summary.stops
      .filter((stop) => stop.durationMinutes >= 5)
      .map((stop) => {
        const visit = visitsByStop.get(stop.index);
        const placeType =
          visit?.customerType === "IMPORTER"
            ? DispatchPlaceTypeDto.IMPORTER
            : visit
              ? DispatchPlaceTypeDto.CLIENT
              : DispatchPlaceTypeDto.OTHER;
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
