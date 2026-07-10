import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ServiceType, WorkOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddWorkOrderMaterialDto } from "./dto/add-work-order-material.dto";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { ReturnWorkOrderMaterialDto } from "./dto/return-work-order-material.dto";
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
        reportType: this.cleanReportType(dto.reportType),
        reportBeforeNotes: this.cleanOptional(dto.reportBeforeNotes),
        reportAfterNotes: this.cleanOptional(dto.reportAfterNotes),
        reportTasks: this.cleanOptional(dto.reportTasks),
        reportTests: this.cleanOptional(dto.reportTests),
        reportRecommendations: this.cleanOptional(dto.reportRecommendations),
        reportPhotos: dto.reportPhotos as Prisma.InputJsonValue[] | undefined,
      },
      include: this.includeRelations(),
    });
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    const current = await this.prisma.workOrder.findUnique({
      where: { id },
      select: { id: true, customerId: true, status: true },
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

    return this.prisma.$transaction(async (tx) => {
      const nextStatus = dto.status as WorkOrderStatus | undefined;
      const completedAt =
        dto.completedAt === ""
          ? null
          : dto.completedAt
            ? new Date(dto.completedAt)
            : nextStatus === "COMPLETED" && current.status !== "COMPLETED"
              ? new Date()
              : undefined;

      const workOrder = await tx.workOrder.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          siteId: dto.siteId === "" ? null : this.cleanNullable(dto.siteId),
          title: this.cleanOptional(dto.title),
          type: dto.type as ServiceType | undefined,
          status: nextStatus,
          scheduledAt: dto.scheduledAt === "" ? null : dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          completedAt,
          notes: this.cleanNullable(dto.notes),
          reportType: this.cleanReportType(dto.reportType),
          reportBeforeNotes: this.cleanNullable(dto.reportBeforeNotes),
          reportAfterNotes: this.cleanNullable(dto.reportAfterNotes),
          reportTasks: this.cleanNullable(dto.reportTasks),
          reportTests: this.cleanNullable(dto.reportTests),
          reportRecommendations: this.cleanNullable(dto.reportRecommendations),
          reportPhotos: dto.reportPhotos as Prisma.InputJsonValue[] | undefined,
        },
        include: this.includeRelations(),
      });

      if (workOrder.status === "COMPLETED") {
        await this.syncCompletedWorkOrderMaterialExpenses(tx, workOrder.id);
      }

      return workOrder;
    });
  }

  async addMaterial(id: string, dto: AddWorkOrderMaterialDto) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          type: true,
          siteId: true,
          customerId: true,
          customer: {
            select: {
              name: true,
              address: true,
            },
          },
        },
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
          costPrice: true,
          currency: true,
          sourceType: true,
        },
      });

      if (!item) {
        throw new NotFoundException("Inventory item not found");
      }

      const stockAfter = item.stock - dto.quantity;
      if (stockAfter < 0) {
        throw new BadRequestException("Stock cannot be negative");
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: stockAfter, managedStock: true },
      });

      const unitCost = Number(item.costPrice ?? 0) || 0;
      const totalCost = unitCost * dto.quantity;
      if (!dto.installAsDevice) {
        return tx.inventoryMovement.create({
          data: {
            itemId: item.id,
            type: "OUT",
            quantity: dto.quantity,
            stockAfter,
            unitCost,
            totalCost,
            currency: item.currency ?? "UYU",
            sourceType: item.sourceType,
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

      const targetSiteId = dto.installAsDevice
        ? await this.ensureWorkOrderSite(tx, workOrder)
        : workOrder.siteId;
      const movements = [];
      for (let index = 0; index < dto.quantity; index += 1) {
        const device = await tx.installedDevice.create({
          data: {
            siteId: targetSiteId!,
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
              unitCost,
              totalCost: unitCost,
              currency: item.currency ?? "UYU",
              sourceType: item.sourceType,
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

  async returnMaterial(id: string, dto: ReturnWorkOrderMaterialDto) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id },
        select: {
          id: true,
          quoteId: true,
          customerId: true,
        },
      });

      if (!workOrder) {
        throw new NotFoundException("Work order not found");
      }

      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.itemId },
        select: {
          id: true,
          name: true,
          stock: true,
          costPrice: true,
          currency: true,
          sourceType: true,
        },
      });

      if (!item) {
        throw new NotFoundException("Inventory item not found");
      }

      const consumed = await tx.inventoryMovement.aggregate({
        where: {
          workOrderId: workOrder.id,
          itemId: item.id,
          type: "OUT",
        },
        _sum: { quantity: true },
      });
      const returned = await tx.inventoryMovement.aggregate({
        where: {
          workOrderId: workOrder.id,
          itemId: item.id,
          type: "IN",
        },
        _sum: { quantity: true },
      });
      const availableToReturn = (consumed._sum.quantity ?? 0) - (returned._sum.quantity ?? 0);

      if (dto.quantity > availableToReturn) {
        throw new BadRequestException(`Solo quedan ${availableToReturn} unidad(es) para devolver de ${item.name}`);
      }

      const stockAfter = item.stock + dto.quantity;
      const unitCost = Number(item.costPrice ?? 0) || 0;
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: stockAfter, managedStock: true },
      });

      return tx.inventoryMovement.create({
        data: {
          itemId: item.id,
          quoteId: workOrder.quoteId,
          type: "IN",
          quantity: dto.quantity,
          stockAfter,
          unitCost,
          totalCost: unitCost * dto.quantity,
          currency: item.currency ?? "UYU",
          sourceType: item.sourceType,
          customerId: workOrder.customerId,
          reason: "Material no instalado devuelto desde orden de trabajo",
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
    });
  }

  async reconcileCosts(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!workOrder) {
        throw new NotFoundException("Work order not found");
      }

      await this.syncCompletedWorkOrderMaterialExpenses(tx, id);

      return tx.workOrder.findUniqueOrThrow({
        where: { id },
        include: this.includeRelations(),
      });
    });
  }

  private async syncCompletedWorkOrderMaterialExpenses(tx: Prisma.TransactionClient, workOrderId: string) {
    const workOrder = await tx.workOrder.findUnique({
      where: { id: workOrderId },
      select: {
        id: true,
        title: true,
        customerId: true,
        quoteId: true,
        quote: { select: { number: true } },
        completedAt: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }

    const movements = await tx.inventoryMovement.findMany({
      where: { workOrderId: workOrder.id },
      include: {
        item: {
          select: {
            costPrice: true,
            currency: true,
          },
        },
      },
    });

    const totalsByCurrency = new Map<string, number>();
    for (const movement of movements) {
      if (movement.type !== "OUT" && movement.type !== "IN") {
        continue;
      }

      const currency = movement.currency ?? movement.item.currency ?? "UYU";
      const unitCost = Number(movement.unitCost ?? movement.item.costPrice ?? 0) || 0;
      const totalCost = Number(movement.totalCost ?? unitCost * movement.quantity) || 0;
      const signedCost = movement.type === "IN" ? -totalCost : totalCost;
      totalsByCurrency.set(currency, (totalsByCurrency.get(currency) ?? 0) + signedCost);
    }

    const referencePrefix = `AUTO-WO-MATERIAL-COST-${workOrder.id}`;
    const activeCurrencies = new Set<string>();

    for (const [currency, rawAmount] of totalsByCurrency.entries()) {
      const amount = this.roundMoney(rawAmount);
      const reference = `${referencePrefix}-${currency}`;
      activeCurrencies.add(currency);

      const existing = await tx.payment.findFirst({
        where: {
          workOrderId: workOrder.id,
          transactionType: "EXPENSE",
          category: "WORK_ORDER_MATERIAL_COST",
          reference,
        },
        select: { id: true },
      });

      if (amount <= 0) {
        if (existing) {
          await tx.payment.delete({ where: { id: existing.id } });
        }
        continue;
      }

      const data = {
        customerId: workOrder.customerId,
        quoteId: workOrder.quoteId,
        workOrderId: workOrder.id,
        transactionType: "EXPENSE",
        category: "WORK_ORDER_MATERIAL_COST",
        concept: `Costo interno de materiales - ${workOrder.title}`,
        amount,
        currency,
        reference,
        notes: [
          "Costo interno generado al completar la orden; no representa una nueva salida de caja.",
          "Calculado con salidas reales de almacen menos devoluciones.",
          workOrder.quote?.number ? `Presupuesto ${workOrder.quote.number}` : "",
        ]
          .filter(Boolean)
          .join(" "),
        paidAt: workOrder.completedAt ?? new Date(),
      };

      if (existing) {
        await tx.payment.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await tx.payment.create({ data });
      }
    }

    const stalePayments = await tx.payment.findMany({
      where: {
        workOrderId: workOrder.id,
        transactionType: "EXPENSE",
        category: "WORK_ORDER_MATERIAL_COST",
        reference: { startsWith: referencePrefix },
      },
      select: { id: true, currency: true },
    });

    for (const payment of stalePayments) {
      if (!activeCurrencies.has(payment.currency)) {
        await tx.payment.delete({ where: { id: payment.id } });
      }
    }
  }

  private includeRelations() {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          reference: true,
          taxId: true,
          logoUrl: true,
          email: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          traccarGeofenceId: true,
          sites: {
            select: {
              id: true,
              name: true,
              address: true,
              latitude: true,
              longitude: true,
              traccarGeofenceId: true,
            },
          },
        },
      },
      site: {
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          traccarGeofenceId: true,
        },
      },
      quote: {
        select: {
          id: true,
          number: true,
          title: true,
          currency: true,
          total: true,
          executionTime: true,
          warranty: true,
          paymentTerms: true,
          commercialTerms: true,
          items: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              inventoryItemId: true,
              type: true,
              category: true,
              description: true,
              quantity: true,
              unit: true,
              unitPrice: true,
              total: true,
              inventoryItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
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
          installedDevice: {
            select: {
              id: true,
              brand: true,
              model: true,
              serial: true,
              ipAddress: true,
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

  private async ensureWorkOrderSite(
    tx: Prisma.TransactionClient,
    workOrder: {
      id: string;
      siteId: string | null;
      customerId: string;
      customer: { name: string; address: string | null };
    },
  ) {
    if (workOrder.siteId) {
      return workOrder.siteId;
    }

    const siteName = workOrder.customer.name.trim();
    const existingSite = await tx.site.findFirst({
      where: {
        customerId: workOrder.customerId,
        name: { equals: siteName, mode: "insensitive" },
      },
      select: { id: true },
    });

    const site =
      existingSite ??
      (await tx.site.create({
        data: {
          customerId: workOrder.customerId,
          name: siteName,
          address: workOrder.customer.address?.trim() || "Direccion principal",
          notes: "Sitio predeterminado creado automaticamente",
        },
        select: { id: true },
      }));

    await tx.workOrder.update({
      where: { id: workOrder.id },
      data: { siteId: site.id },
    });

    return site.id;
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

  private cleanReportType(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    return value === "NEW_INSTALLATION" ? "NEW_INSTALLATION" : "REPAIR";
  }

  private roundMoney(value: number) {
    return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
  }
}
