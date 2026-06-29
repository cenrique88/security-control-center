import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InventoryMovementType, Prisma, ServiceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";

type InventoryFilters = {
  search?: string;
  category?: ServiceType;
  lowStock?: string;
  supplier?: string;
  mode?: "catalog" | "stock" | "all";
};

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: InventoryFilters) {
    const where: Prisma.InventoryItemWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.supplier?.trim()) {
      where.supplier = filters.supplier.trim();
    }

    if (filters.mode === "catalog") {
      where.managedStock = false;
    } else if (filters.mode !== "all") {
      where.managedStock = true;
    }

    if (filters.lowStock === "true") {
      where.managedStock = true;
      where.stock = { lte: this.prisma.inventoryItem.fields.minStock };
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { sku: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { supplier: { contains: query, mode: "insensitive" } },
        { supplierCategory: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
      ];
    }

    return this.prisma.inventoryItem.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: this.movementInclude(),
        },
      },
    });
  }

  async createItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: {
        sku: this.cleanNullable(dto.sku),
        name: dto.name.trim(),
        category: dto.category as ServiceType | undefined,
        unit: this.cleanOptional(dto.unit) ?? "u",
        stock: dto.stock ?? 0,
        minStock: dto.minStock ?? 0,
        managedStock: dto.managedStock ?? true,
        location: this.cleanNullable(dto.location),
        supplier: this.cleanNullable(dto.supplier),
        supplierCategory: this.cleanNullable(dto.supplierCategory),
        costPrice: dto.costPrice,
        taxAmount: dto.taxAmount,
        priceWithTax: dto.priceWithTax,
        currency: this.cleanOptional(dto.currency) ?? "USD",
        notes: this.cleanNullable(dto.notes),
      },
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: this.movementInclude(),
        },
      },
    });
  }

  async updateItem(id: string, dto: CreateInventoryItemDto) {
    const current = await this.prisma.inventoryItem.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Inventory item not found");
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        sku: dto.sku === undefined ? undefined : this.cleanNullable(dto.sku),
        name: dto.name?.trim(),
        category: dto.category === undefined ? undefined : dto.category ? (dto.category as ServiceType) : null,
        unit: this.cleanOptional(dto.unit),
        stock: dto.stock,
        minStock: dto.minStock,
        managedStock: dto.managedStock,
        location: dto.location === undefined ? undefined : this.cleanNullable(dto.location),
        supplier: dto.supplier === undefined ? undefined : this.cleanNullable(dto.supplier),
        supplierCategory: dto.supplierCategory === undefined ? undefined : this.cleanNullable(dto.supplierCategory),
        costPrice: dto.costPrice,
        taxAmount: dto.taxAmount,
        priceWithTax: dto.priceWithTax,
        currency: this.cleanOptional(dto.currency),
        notes: dto.notes === undefined ? undefined : this.cleanNullable(dto.notes),
      },
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: this.movementInclude(),
        },
      },
    });
  }

  async createMovement(dto: CreateInventoryMovementDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.itemId },
        select: { id: true, stock: true },
      });

      if (!item) {
        throw new NotFoundException("Inventory item not found");
      }

      if (dto.workOrderId) {
        await this.ensureWorkOrder(tx, dto.workOrderId);
      }

      if (dto.installedDeviceId) {
        await this.ensureInstalledDevice(tx, dto.installedDeviceId);
      }

      const type = dto.type as InventoryMovementType;
      const quantity = dto.quantity;
      const stockAfter =
        type === "IN" ? item.stock + quantity : type === "OUT" ? item.stock - quantity : quantity;

      if (stockAfter < 0) {
        throw new BadRequestException("Stock cannot be negative");
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: stockAfter, managedStock: true },
      });

      return tx.inventoryMovement.create({
        data: {
          itemId: item.id,
          type,
          quantity,
          stockAfter,
          reason: this.cleanNullable(dto.reason),
          workOrderId: this.cleanNullable(dto.workOrderId),
          installedDeviceId: this.cleanNullable(dto.installedDeviceId),
        },
        include: {
          item: true,
          ...this.movementInclude(),
        },
      });
    });
  }

  async deleteMovement(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!movement) {
        throw new NotFoundException("Inventory movement not found");
      }

      const stockAfterDelete =
        movement.type === "OUT"
          ? movement.item.stock + movement.quantity
          : movement.type === "IN"
            ? movement.item.stock - movement.quantity
            : movement.item.stock;

      if (stockAfterDelete < 0) {
        throw new BadRequestException("Stock cannot be negative");
      }

      await tx.inventoryItem.update({
        where: { id: movement.itemId },
        data: { stock: stockAfterDelete, managedStock: true },
      });

      const deletedMovement = await tx.inventoryMovement.delete({
        where: { id },
        include: {
          item: true,
          ...this.movementInclude(),
        },
      });

      if (movement.installedDeviceId) {
        await tx.installedDevice.delete({ where: { id: movement.installedDeviceId } });
      }

      return deletedMovement;
    });
  }

  async deleteItem(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { movements: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Inventory item not found");
    }

    if (item._count.movements > 0) {
      throw new BadRequestException("Inventory item has movements");
    }

    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async summary() {
    const [items, outOfStock, movements] = await Promise.all([
      this.prisma.inventoryItem.findMany({ where: { managedStock: true }, select: { id: true, stock: true, minStock: true } }),
      this.prisma.inventoryItem.count({ where: { managedStock: true, stock: 0 } }),
      this.prisma.inventoryMovement.count(),
    ]);

    return {
      totalItems: items.length,
      lowStock: items.filter((item) => item.stock <= item.minStock).length,
      outOfStock,
      movements,
    };
  }

  private movementInclude() {
    return {
      workOrder: {
        select: {
          id: true,
          title: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      installedDevice: {
        select: {
          id: true,
          brand: true,
          model: true,
          serial: true,
        },
      },
    } satisfies Prisma.InventoryMovementInclude;
  }

  private async ensureWorkOrder(tx: Prisma.TransactionClient, id: string) {
    const workOrder = await tx.workOrder.findUnique({ where: { id }, select: { id: true } });
    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }
  }

  private async ensureInstalledDevice(tx: Prisma.TransactionClient, id: string) {
    const device = await tx.installedDevice.findUnique({ where: { id }, select: { id: true } });
    if (!device) {
      throw new NotFoundException("Installed device not found");
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
