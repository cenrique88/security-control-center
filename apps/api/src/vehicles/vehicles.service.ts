import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

type VehicleFilters = {
  search?: string;
  active?: boolean;
};

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: VehicleFilters) {
    const where: Prisma.VehicleWhereInput = {};

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

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        name: dto.name.trim(),
        plate: this.cleanOptional(dto.plate),
        traccarDeviceId: this.cleanOptional(dto.traccarDeviceId),
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.ensureExists(id);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        name: this.cleanOptional(dto.name),
        plate: this.cleanNullable(dto.plate),
        traccarDeviceId: this.cleanNullable(dto.traccarDeviceId),
        active: dto.active,
      },
    });
  }

  private async ensureExists(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id }, select: { id: true } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }

  private cleanNullable(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const clean = value.trim();
    return clean ? clean : null;
  }
}
