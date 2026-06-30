import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeviceDto } from "./dto/create-device.dto";

type DeviceFilters = {
  search?: string;
  customerId?: string;
  siteId?: string;
  type?: ServiceType;
};

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: DeviceFilters) {
    const where: Prisma.InstalledDeviceWhereInput = {
      inventoryMovements: {
        some: {
          workOrderId: { not: null },
        },
      },
    };

    if (filters.siteId) {
      where.siteId = filters.siteId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.customerId) {
      where.site = { customerId: filters.customerId };
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
        { serial: { contains: query, mode: "insensitive" } },
        { ipAddress: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        { site: { name: { contains: query, mode: "insensitive" } } },
        { site: { customer: { name: { contains: query, mode: "insensitive" } } } },
        { inventoryMovements: { some: { workOrder: { title: { contains: query, mode: "insensitive" } } } } },
      ];
    }

    return this.prisma.installedDevice.findMany({
      where,
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
  }

  async create(dto: CreateDeviceDto) {
    const site = await this.prisma.site.findUnique({ where: { id: dto.siteId }, select: { id: true } });
    if (!site) {
      throw new NotFoundException("Site not found");
    }

    return this.prisma.installedDevice.create({
      data: {
        siteId: dto.siteId,
        type: dto.type as ServiceType,
        brand: this.cleanOptional(dto.brand),
        model: this.cleanOptional(dto.model),
        serial: this.cleanOptional(dto.serial),
        ipAddress: this.cleanOptional(dto.ipAddress),
        installedAt: dto.installedAt ? new Date(dto.installedAt) : undefined,
        notes: this.cleanOptional(dto.notes),
      },
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
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }
}
