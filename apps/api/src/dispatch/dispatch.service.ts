import { Injectable } from "@nestjs/common";
import { DispatchPlaceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SaveDispatchStopsDto } from "./dto/save-dispatch-stops.dto";

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

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

  async places() {
    return this.prisma.dispatchStop.findMany({
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
    });
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
