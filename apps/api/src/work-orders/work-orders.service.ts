import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ServiceType, WorkOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddWorkOrderMaterialDto } from "./dto/add-work-order-material.dto";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";

type WorkOrderFilters = {
  search?: string;
  customerId?: string;
  siteId?: string;
  type?: ServiceType;
  status?: WorkOrderStatus;
};

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: WorkOrderFilters) {
    const where: Prisma.WorkOrderWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.siteId) {
      where.siteId = filters.siteId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
        { site: { name: { contains: query, mode: "insensitive" } } },
        { site: { address: { contains: query, mode: "insensitive" } } },
      ];
    }

    return this.prisma.workOrder.findMany({
      where,
      orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
      include: this.includeRelations(),
    });
  }

  async create(dto: CreateWorkOrderDto) {
    await this.ensureCustomer(dto.customerId);
    if (dto.siteId) {
      await this.ensureSiteBelongsToCustomer(dto.siteId, dto.customerId);
    }

    return this.prisma.workOrder.create({
      data: {
        customerId: dto.customerId,
        siteId: this.cleanOptional(dto.siteId),
        title: dto.title.trim(),
        type: dto.type as ServiceType,
        status: (dto.status as WorkOrderStatus | undefined) ?? "SCHEDULED",
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        notes: this.cleanOptional(dto.notes),
      },
      include: this.includeRelations(),
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    const current = await this.prisma.workOrder.findUnique({
      where: { id },
      select: { id: true, customerId: true },
    });

    if (!current) {
      throw new NotFoundException("Work order not found");
    }

    const customerId = dto.customerId ?? current.customerId;
    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    if (dto.siteId) {
      await this.ensureSiteBelongsToCustomer(dto.siteId, customerId);
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        siteId: dto.siteId === "" ? null : this.cleanNullable(dto.siteId),
        title: this.cleanOptional(dto.title),
        type: dto.type as ServiceType | undefined,
        status: dto.status as WorkOrderStatus | undefined,
        scheduledAt: dto.scheduledAt === "" ? null : dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        completedAt: dto.completedAt === "" ? null : dto.completedAt ? new Date(dto.completedAt) : undefined,
        notes: this.cleanNullable(dto.notes),
      },
      include: this.includeRelations(),
    });
  }

  async addMaterial(id: string, dto: AddWorkOrderMaterialDto) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id },
        select: { id: true, title: true, type: true, siteId: true },
      });

      if (!workOrder) {
        throw new NotFoundException("Work order not found");
      }

      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.itemId },
        select: {
          id: true,
          sku: true,
          name: true,
          category: true,
          supplier: true,
          stock: true,
        },
      });

      if (!item) {
        throw new NotFoundException("Inventory item not found");
      }

      if (dto.installAsDevice && !workOrder.siteId) {
        throw new BadRequestException("Work order site is required to install devices");
      }

      const stockAfter = item.stock - dto.quantity;
      if (stockAfter < 0) {
        throw new BadRequestException("Stock cannot be negative");
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: stockAfter, managedStock: true },
      });

      if (!dto.installAsDevice) {
        return tx.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "OUT",
            quantity: dto.quantity,
            stockAfter,
            reason: "Asignado a orden de trabajo",
            workOrderId: workOrder.id,
          },
          include: {
            item: true,
            workOrder: {
              select: {
                id: true,
                title: true,
                customer: { select: { id: true, name: true } },
              },
            },
            installedDevice: true,
          },
        });
      }

      const movements = [];
      for (let index = 0; index < dto.quantity; index += 1) {
        const device = await tx.installedDevice.create({
          data: {
            siteId: workOrder.siteId!,
            type: item.category ?? workOrder.type,
            brand: this.cleanOptional(item.supplier ?? undefined),
            model: item.name,
            installedAt: new Date(),
            notes: [workOrder.title, item.sku ? `SKU ${item.sku}` : ""].filter(Boolean).join(" - "),
          },
        });

        movements.push(
          await tx.inventoryMovement.create({
            data: {
              itemId: item.id,
              type: "OUT",
              quantity: 1,
              stockAfter: item.stock - index - 1,
              reason: "Asignado a orden de trabajo e instalado como equipo",
              workOrderId: workOrder.id,
              installedDeviceId: device.id,
            },
            include: {
              item: true,
              workOrder: {
                select: {
                  id: true,
                  title: true,
                  customer: { select: { id: true, name: true } },
                },
              },
              installedDevice: true,
            },
          }),
        );
      }

      return movements;
    });
  }

  private includeRelations() {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      site: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      inventoryMovements: {
        orderBy: { createdAt: "desc" },
        include: {
          item: {
            select: {
              id: true,
              sku: true,
              name: true,
              unit: true,
            },
          },
        },
      },
    } satisfies Prisma.WorkOrderInclude;
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async ensureSiteBelongsToCustomer(siteId: string, customerId: string) {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, customerId: true },
    });

    if (!site) {
      throw new NotFoundException("Site not found");
    }

    if (site.customerId !== customerId) {
      throw new BadRequestException("Site does not belong to customer");
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
