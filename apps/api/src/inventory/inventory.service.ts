import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InventoryMovementType, Prisma, ServiceType } from "@prisma/client";
import { execFile } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementBatchDto, CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
import { ImportInvoiceDto } from "./dto/import-invoice.dto";

const execFileAsync = promisify(execFile);

type InventoryFilters = {
  search?: string;
  category?: ServiceType;
  lowStock?: string;
  supplier?: string;
  customerId?: string;
  sourceType?: string;
  mode?: "catalog" | "stock" | "all" | "archived";
};

type ParsedInvoiceItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
};

type ParsedInvoice = {
  providerName: string;
  providerTaxId?: string;
  providerAddress?: string;
  buyerName?: string;
  date?: string;
  currency: string;
  invoiceType?: string;
  series?: string;
  number?: string;
  reference: string;
  items: ParsedInvoiceItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  rawText: string;
  warnings?: string[];
  extractedTextLength?: number;
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

    if (filters.customerId?.trim()) {
      where.customerId = filters.customerId.trim();
    }

    if (filters.mode === "archived") {
      where.sourceType = "ARCHIVED";
    } else {
      where.sourceType = { not: "ARCHIVED" };
    }

    if (filters.sourceType?.trim() && filters.mode !== "archived") {
      where.sourceType = filters.sourceType.trim();
    }

    if (filters.mode === "archived") {
      // Keep archived items independent from stock/catalog filters.
    } else if (filters.mode === "catalog") {
      where.managedStock = false;
    } else if (filters.mode !== "all") {
      where.managedStock = true;
      where.stock = { gt: 0 };
    }

    if (filters.lowStock === "true") {
      where.managedStock = true;
      where.stock = 0;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { sku: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { supplier: { contains: query, mode: "insensitive" } },
        { supplierCategory: { contains: query, mode: "insensitive" } },
        { sourceType: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
        { notes: { contains: query, mode: "insensitive" } },
      ];
    }

    try {
      const items = await this.prisma.inventoryItem.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }],
        include: {
          customer: true,
          movements: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: this.movementInclude(),
          },
        },
      });

      const installedByItem = await this.installedQuantityByItem(items.map((item) => item.id));

      return items.map((item) => ({
        ...item,
        installedQuantity: installedByItem.get(item.id) ?? 0,
      }));
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async createItem(dto: CreateInventoryItemDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        return tx.inventoryItem.create({
          data: {
            reference: await this.nextReference(tx),
            sku: this.cleanNullable(dto.sku),
            name: dto.name.trim(),
            category: dto.category as ServiceType | undefined,
            unit: this.cleanOptional(dto.unit) ?? "u",
            stock: dto.stock ?? 0,
            minStock: dto.minStock ?? 0,
            managedStock: dto.managedStock ?? true,
            sourceType: this.cleanOptional(dto.sourceType) ?? "MATERIAL",
            customerId: this.cleanNullable(dto.customerId),
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
            customer: true,
          },
        });
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateItem(id: string, dto: CreateInventoryItemDto) {
    const current = await this.prisma.inventoryItem.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Inventory item not found");
    }

    try {
      return await this.prisma.inventoryItem.update({
        where: { id },
        data: {
          sku: dto.sku === undefined ? undefined : this.cleanNullable(dto.sku),
          name: dto.name?.trim(),
          category: dto.category === undefined ? undefined : dto.category ? (dto.category as ServiceType) : null,
          unit: this.cleanOptional(dto.unit),
          stock: dto.stock,
          minStock: dto.minStock,
          managedStock: dto.managedStock,
          sourceType: this.cleanOptional(dto.sourceType),
          customerId: dto.customerId === undefined ? undefined : this.cleanNullable(dto.customerId),
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
          customer: true,
        },
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async createMovement(dto: CreateInventoryMovementDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.itemId },
        select: { id: true, name: true, stock: true, costPrice: true, priceWithTax: true, currency: true },
      });

      if (!item) {
        throw new NotFoundException("Inventory item not found");
      }

      if (dto.workOrderId) {
        await this.ensureWorkOrder(tx, dto.workOrderId);
      }

      const linkedCustomer = dto.customerId ? await this.ensureCustomer(tx, dto.customerId) : null;

      if (dto.installedDeviceId) {
        await this.ensureInstalledDevice(tx, dto.installedDeviceId);
      }

      const type = dto.type as InventoryMovementType;
      const quantity = dto.quantity;
      const stockAfter =
        type === "IN" ? item.stock + quantity : type === "OUT" ? item.stock - quantity : quantity;
      const unitCost = Number(dto.unitCost) || Number(item.costPrice ?? item.priceWithTax) || undefined;
      const totalCost = unitCost && quantity ? unitCost * quantity : undefined;
      const currency = this.cleanOptional(dto.currency) ?? item.currency ?? "UYU";

      if (stockAfter < 0) {
        throw new BadRequestException("Stock cannot be negative");
      }

      if (dto.createExpense && !dto.customerId) {
        throw new BadRequestException("Selecciona una entidad para crear el egreso contable");
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          stock: stockAfter,
          managedStock: true,
          costPrice: unitCost,
          priceWithTax: unitCost,
          currency,
          sourceType: this.cleanOptional(dto.sourceType) ?? undefined,
          customerId: dto.customerId ? dto.customerId : undefined,
          supplier: linkedCustomer?.type === "IMPORTER" ? linkedCustomer.name : undefined,
          supplierCategory: linkedCustomer?.type === "IMPORTER" ? "Importador" : undefined,
        },
      });

      const payment =
        dto.createExpense && (type === "IN" || type === "OUT") && dto.customerId && totalCost
          ? await tx.payment.create({
              data: {
                customerId: dto.customerId,
                workOrderId: this.cleanNullable(dto.workOrderId),
                inventoryItemId: item.id,
                transactionType: "EXPENSE",
                category: this.cleanOptional(dto.paymentCategory) ?? this.paymentCategoryFromSource(dto.sourceType, type),
                concept:
                  this.cleanOptional(dto.reason) ??
                  (type === "OUT" ? `Consumo de almacen: ${item.name}` : `Compra para almacen: ${item.name}`),
                amount: totalCost,
                quantity,
                unitPrice: unitCost,
                currency,
                method: this.cleanOptional(dto.paymentMethod),
                reference: this.cleanOptional(dto.paymentReference),
                notes:
                  type === "OUT"
                    ? "Generado desde salida justificada de almacen"
                    : "Generado desde movimiento de entrada de almacen",
                paidAt: new Date(),
              },
              select: { id: true },
            })
          : null;

      return tx.inventoryMovement.create({
        data: {
          itemId: item.id,
          paymentId: payment?.id,
          type,
          quantity,
          stockAfter,
          unitCost,
          totalCost,
          currency,
          sourceType: this.cleanNullable(dto.sourceType),
          customerId: this.cleanNullable(dto.customerId),
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

  async createMovementBatch(dto: CreateInventoryMovementBatchDto) {
    return this.prisma.$transaction(async (tx) => {
      if (!dto.items.length) {
        throw new BadRequestException("Agrega al menos un articulo al movimiento");
      }

      const type = dto.type as InventoryMovementType;
      if (dto.createExpense && !dto.customerId) {
        throw new BadRequestException("Selecciona una entidad para crear el egreso contable");
      }

      if (dto.workOrderId) {
        await this.ensureWorkOrder(tx, dto.workOrderId);
      }

      const linkedCustomer = dto.customerId ? await this.ensureCustomer(tx, dto.customerId) : null;

      if (dto.installedDeviceId) {
        await this.ensureInstalledDevice(tx, dto.installedDeviceId);
      }

      const normalizedItems = dto.items
        .map((item) => ({
          ...item,
          type,
          quantity: Math.trunc(Number(item.quantity) || 0),
        }))
        .filter((item) => item.itemId && item.quantity > 0);

      if (!normalizedItems.length) {
        throw new BadRequestException("Agrega articulos con cantidad mayor a cero");
      }

      const itemIds = [...new Set(normalizedItems.map((item) => item.itemId))];
      if (itemIds.length !== normalizedItems.length) {
        throw new BadRequestException("No repitas articulos en la misma salida; ajusta la cantidad de una sola linea");
      }

      const dbItems = await tx.inventoryItem.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, name: true, stock: true, costPrice: true, priceWithTax: true, currency: true },
      });
      const itemById = new Map(dbItems.map((item) => [item.id, item]));

      if (dbItems.length !== itemIds.length) {
        throw new NotFoundException("Uno o mas articulos no existen");
      }

      const movementLines = normalizedItems.map((line) => {
        const item = itemById.get(line.itemId)!;
        const quantity = line.quantity;
        const stockAfter =
          type === "IN" ? item.stock + quantity : type === "OUT" ? item.stock - quantity : quantity;
        if (stockAfter < 0) {
          throw new BadRequestException(`Stock insuficiente para ${item.name}. Disponible: ${item.stock}`);
        }

        const unitCost = Number(line.unitCost) || Number(item.costPrice ?? item.priceWithTax) || undefined;
        const totalCost = unitCost && quantity ? unitCost * quantity : undefined;
        const currency = this.cleanOptional(line.currency) ?? this.cleanOptional(dto.currency) ?? item.currency ?? "UYU";

        return { line, item, quantity, stockAfter, unitCost, totalCost, currency };
      });

      const batchTotal = movementLines.reduce((total, line) => total + (line.totalCost ?? 0), 0);
      const currency = movementLines[0]?.currency ?? this.cleanOptional(dto.currency) ?? "UYU";
      const reason = this.cleanOptional(dto.reason);
      const payment =
        dto.createExpense && (type === "IN" || type === "OUT") && dto.customerId && batchTotal > 0
          ? await tx.payment.create({
              data: {
                customerId: dto.customerId,
                workOrderId: this.cleanNullable(dto.workOrderId),
                transactionType: "EXPENSE",
                category: this.cleanOptional(dto.paymentCategory) ?? this.paymentCategoryFromSource(dto.sourceType, type),
                concept:
                  reason ??
                  (type === "OUT"
                    ? `Salida de almacen: ${movementLines.length} articulos`
                    : `Entrada de almacen: ${movementLines.length} articulos`),
                amount: batchTotal,
                quantity: movementLines.reduce((total, line) => total + line.quantity, 0),
                currency,
                method: this.cleanOptional(dto.paymentMethod),
                reference: this.cleanOptional(dto.paymentReference),
                notes:
                  type === "OUT"
                    ? `Salida justificada de almacen con ${movementLines.length} articulo(s)`
                    : `Entrada de almacen con ${movementLines.length} articulo(s)`,
                paidAt: new Date(),
              },
              select: { id: true },
            })
          : null;

      const createdMovements = [];
      for (const movement of movementLines) {
        await tx.inventoryItem.update({
          where: { id: movement.item.id },
          data: {
            stock: movement.stockAfter,
            managedStock: true,
            costPrice: movement.unitCost,
            priceWithTax: movement.unitCost,
            currency: movement.currency,
            sourceType: this.cleanOptional(dto.sourceType ?? movement.line.sourceType) ?? undefined,
            customerId: dto.customerId ? dto.customerId : undefined,
            supplier: linkedCustomer?.type === "IMPORTER" ? linkedCustomer.name : undefined,
            supplierCategory: linkedCustomer?.type === "IMPORTER" ? "Importador" : undefined,
          },
        });

        createdMovements.push(
          await tx.inventoryMovement.create({
            data: {
              itemId: movement.item.id,
              paymentId: payment?.id,
              type,
              quantity: movement.quantity,
              stockAfter: movement.stockAfter,
              unitCost: movement.unitCost,
              totalCost: movement.totalCost,
              currency: movement.currency,
              sourceType: this.cleanNullable(dto.sourceType ?? movement.line.sourceType),
              customerId: this.cleanNullable(dto.customerId),
              reason: this.cleanNullable(reason),
              workOrderId: this.cleanNullable(dto.workOrderId),
              installedDeviceId: this.cleanNullable(dto.installedDeviceId),
            },
            include: {
              item: true,
              ...this.movementInclude(),
            },
          }),
        );
      }

      return { paymentId: payment?.id ?? null, movements: createdMovements };
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

      const installedDeviceId = movement.installedDeviceId;
      const deletedMovement = await tx.inventoryMovement.delete({
        where: { id },
        include: {
          item: true,
          ...this.movementInclude(),
        },
      });

      if (installedDeviceId) {
        const remainingMovements = await tx.inventoryMovement.count({
          where: { installedDeviceId },
        });

        if (remainingMovements === 0) {
          await tx.installedDevice.deleteMany({
            where: { id: installedDeviceId },
          });
        }
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
      return this.prisma.inventoryItem.update({
        where: { id },
        data: {
          stock: 0,
          managedStock: false,
          sourceType: "ARCHIVED",
          notes: {
            set: "Archivado: articulo oculto porque tenia movimientos historicos.",
          },
        },
      });
    }

    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async summary() {
    const [items, outOfStock, movements, installed] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where: { managedStock: true, sourceType: { not: "ARCHIVED" } },
        select: { id: true, stock: true },
      }),
      this.prisma.inventoryItem.count({ where: { managedStock: true, stock: 0, sourceType: { not: "ARCHIVED" } } }),
      this.prisma.inventoryMovement.count(),
      this.prisma.inventoryMovement.aggregate({
        where: {
          type: "OUT",
          installedDeviceId: { not: null },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      totalItems: items.length,
      lowStock: outOfStock,
      outOfStock,
      movements,
      installed: installed._sum.quantity ?? 0,
      availableStock: items.reduce((total, item) => total + item.stock, 0),
    };
  }

  async previewInvoice(dto: ImportInvoiceDto) {
    const text = await this.extractInvoiceText(dto.dataUrl);
    return this.parseInvoiceText(text, dto.fileName);
  }

  async importInvoice(dto: ImportInvoiceDto) {
    const preview = await this.previewInvoice(dto);
    if (!preview.items.length) {
      throw new BadRequestException("No se encontraron materiales en la factura");
    }

    return this.prisma.$transaction(async (tx) => {
      const importer = await this.findOrCreateImporter(tx, preview);
      const payment = await tx.payment.create({
        data: {
          customerId: importer.id,
          transactionType: "EXPENSE",
          category: "MATERIAL_PURCHASE",
          concept: `Factura ${preview.reference} - ${preview.providerName}`,
          amount: preview.totals.total,
          currency: preview.currency,
          method: "Factura",
          reference: preview.reference,
          notes: `Importado automaticamente desde ${dto.fileName || "PDF"}. Subtotal ${preview.totals.subtotal}, IVA ${preview.totals.tax}.`,
          paidAt: preview.date ? this.parseInvoiceDate(preview.date) : new Date(),
        },
        select: { id: true },
      });

      const movements = [];
      for (const item of preview.items) {
        const inventoryItem = await this.findOrCreateInvoiceItem(tx, item, importer.id, preview.providerName, preview.currency);
        const stockAfter = inventoryItem.stock + item.quantity;
        const unitWithTax = this.roundMoney(item.unitPrice * (1 + item.taxRate / 100));
        const totalCost = this.roundMoney(item.unitPrice * item.quantity);

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            stock: stockAfter,
            managedStock: true,
            sourceType: "MATERIAL",
            customerId: importer.id,
            supplier: preview.providerName,
            supplierCategory: "Importador",
            costPrice: this.roundMoney(item.unitPrice),
            taxAmount: this.roundMoney(unitWithTax - item.unitPrice),
            priceWithTax: unitWithTax,
            currency: preview.currency,
            notes: `Ultima entrada por factura ${preview.reference}`,
          },
        });

        movements.push(
          await tx.inventoryMovement.create({
            data: {
              itemId: inventoryItem.id,
              paymentId: payment.id,
              type: "IN",
              quantity: item.quantity,
              stockAfter,
              unitCost: this.roundMoney(item.unitPrice),
              totalCost,
              currency: preview.currency,
              sourceType: "MATERIAL",
              customerId: importer.id,
              reason: `Factura ${preview.reference}`,
            },
            include: {
              item: true,
              ...this.movementInclude(),
            },
          }),
        );
      }

      return {
        importer,
        paymentId: payment.id,
        movements,
        invoice: preview,
      };
    });
  }

  private async installedQuantityByItem(itemIds: string[]) {
    if (!itemIds.length) {
      return new Map<string, number>();
    }

    const grouped = await this.prisma.inventoryMovement.groupBy({
      by: ["itemId"],
      where: {
        itemId: { in: itemIds },
        type: "OUT",
        installedDeviceId: { not: null },
      },
      _sum: {
        quantity: true,
      },
    });

    return new Map(grouped.map((item) => [item.itemId, item._sum.quantity ?? 0]));
  }

  private async extractInvoiceText(dataUrl: string) {
    const match = dataUrl.match(/^data:application\/pdf(?:;[^,]*)?;base64,(.+)$/);
    if (!match) {
      throw new BadRequestException("Adjunta una factura PDF valida");
    }

    const buffer = Buffer.from(match[1], "base64");
    if (!buffer.length) {
      throw new BadRequestException("El PDF esta vacio");
    }

    const dir = join(tmpdir(), "sscc-invoices");
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `invoice-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`);
    await writeFile(filePath, buffer);

    try {
      const scriptPath = resolve(__dirname, "..", "..", "scripts", "extract_invoice_text.py");
      const { stdout } = await this.runPython(scriptPath, filePath);
      const parsed = JSON.parse(stdout) as { text?: string; error?: string };
      if (parsed.error) {
        throw new BadRequestException(parsed.error);
      }
      return parsed.text || "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo leer el PDF";
      throw new BadRequestException(`No se pudo leer la factura PDF: ${message}`);
    } finally {
      await unlink(filePath).catch(() => undefined);
    }
  }

  private async runPython(scriptPath: string, filePath: string) {
    const candidates = [
      process.env.PYTHON_BIN,
      process.env.PYTHON_PATH,
      process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Programs", "Python", "Python312", "python.exe") : undefined,
      "python",
      "py",
    ].filter(Boolean) as string[];

    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        return await execFileAsync(candidate, [scriptPath, filePath], {
          maxBuffer: 1024 * 1024 * 10,
        });
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Python no disponible");
  }

  private parseInvoiceText(text: string, fileName?: string): ParsedInvoice {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const providerName = this.findProviderName(lines) || "Proveedor sin identificar";
    const rutIndex = lines.findIndex((line) => /R\.?U\.?T\.?/i.test(line));
    const providerAddress = rutIndex > 1 ? lines.slice(1, rutIndex).join(", ") : undefined;
    const providerTaxId = this.firstMatch(text, /R\.?U\.?T\.?\s*(\d{8,14})/i) || this.firstMatch(text, /RUT[^\n]*\n(\d{8,14})/i);
    const buyerName =
      this.firstMatch(text, /Cliente\s+(.+?)(?:\s+Doc\.|\n|$)/i) ||
      lines.find((line) => /Security Solutions|Solutions/i.test(line) && !line.includes(providerName));
    const date = this.firstMatch(text, /Fecha\s+(\d{2}[-/]\d{2}[-/]\d{4})/i) || this.firstMatch(text, /Fecha\s+Moneda\s*\n(\d{2}[-/]\d{2}[-/]\d{4})/i);
    const currency =
      this.firstMatch(text, /Moneda\s+([A-Z]{3})/i) ||
      this.firstMatch(text, /Fecha\s+Moneda\s*\n\d{2}[-/]\d{2}[-/]\d{4}\s+([A-Z]{3})/i) ||
      "UYU";
    const invoiceType =
      this.firstMatch(text, /Tipo CFE\s+([^\n]+)/i) ||
      this.firstMatch(text, /RUT\s+TIPO DE DOCUMENTO\s*\n\d{8,14}\s+([^\n]+)/i) ||
      this.firstMatch(text, /\b(eFactura|e-Ticket|Factura)\b/i);
    const series = this.firstMatch(text, /Serie\s+([A-Z]+)/i) || this.firstMatch(text, /SERIE\s+NUMERO[^\n]*\n([A-Z]+)/i);
    const number = this.firstMatch(text, /N[uú]mero\s+(\d+)/i) || this.firstMatch(text, /SERIE\s+NUMERO[^\n]*\n[A-Z]+\s+(\d+)/i);
    const reference = [series, number].filter(Boolean).join("-") || fileName || `FACT-${Date.now()}`;
    const items = this.parseInvoiceItems(lines);
    const subtotal = this.roundMoney(this.numberAfterLabel(text, /Subtotal\s+gravado\s+22%/i) ?? items.reduce((total, item) => total + item.subtotal, 0));
    const tax = this.roundMoney(this.numberAfterLabel(text, /I\.?V\.?A\.?\s+22%/i) ?? subtotal * 0.22);
    const total = this.roundMoney(this.numberAfterLabel(text, /Monto\s+Total|Total:/i) ?? subtotal + tax);

    const warnings: string[] = [];
    if (!text.trim()) {
      warnings.push(
        "El PDF no contiene texto legible. Parece un escaneo o una imagen dentro del PDF; para leerlo automaticamente hace falta OCR.",
      );
    } else if (!items.length) {
      warnings.push(
        "Se pudo leer texto del PDF, pero no se encontraron lineas de articulos con cantidad y precio. Puede ser un formato de factura distinto.",
      );
    }

    return {
      providerName,
      providerTaxId,
      providerAddress,
      buyerName,
      date,
      currency,
      invoiceType,
      series,
      number,
      reference,
      items,
      totals: { subtotal, tax, total },
      rawText: text,
      warnings,
      extractedTextLength: text.trim().length,
    };
  }

  private parseInvoiceItems(lines: string[]) {
    const items: ParsedInvoiceItem[] = [];
    const rowPattern = /^(.+?)\s+(\d+(?:[,.]\d+)?)\s+(\d+(?:[,.]\d+)?)\s+(\d{1,2}(?:[,.]\d+)?)\s+(-?\d+(?:[,.]\d+)?)$/;

    for (const line of lines) {
      if (/^(C[oó]digo|Nombre|Cantidad|Precio|Descuentos?|Recargos?|Subtotal|IVA|Monto|Redondeo|CAE|Puede verificar)/i.test(line)) {
        continue;
      }

      const match = line.match(rowPattern);
      if (!match) {
        continue;
      }

      const description = match[1].trim();
      if (!description || /redondeo/i.test(description)) {
        continue;
      }

      const quantity = Math.round(this.parseLocalNumber(match[2]));
      const unitPrice = this.roundMoney(this.parseLocalNumber(match[3]));
      const taxRate = this.parseLocalNumber(match[4]);
      const subtotal = this.roundMoney(this.parseLocalNumber(match[5]));
      if (quantity <= 0 || unitPrice <= 0) {
        continue;
      }

      items.push({
        description,
        quantity,
        unit: "u",
        unitPrice,
        taxRate,
        subtotal,
      });
    }

    return items;
  }

  private findProviderName(lines: string[]) {
    const buyerDocIndex = lines.findIndex((line) => /DOC\.?\s+COMPRADOR/i.test(line));
    if (buyerDocIndex >= 0) {
      const provider = lines.slice(buyerDocIndex + 1).find((line) => {
        if (/^\d+$/.test(line) || /DATOS DEL CLIENTE/i.test(line)) {
          return false;
        }
        return /S\.?A\.?|S\.?R\.?L\.?|LTDA|IMPORT|PROVEEDOR/i.test(line);
      });
      if (provider) {
        return provider;
      }
    }

    return lines.find((line) => /S\.?A\.?|S\.?R\.?L\.?|LTDA|IMPORT|PROVEEDOR/i.test(line));
  }

  private async findOrCreateImporter(tx: Prisma.TransactionClient, invoice: ParsedInvoice) {
    const existing = await tx.customer.findFirst({
      where: invoice.providerTaxId
        ? { taxId: invoice.providerTaxId }
        : { name: { equals: invoice.providerName, mode: "insensitive" } },
      select: { id: true, name: true, type: true },
    });

    if (existing) {
      if (existing.type !== "IMPORTER") {
        return tx.customer.update({
          where: { id: existing.id },
          data: { type: "IMPORTER" },
          select: { id: true, name: true, type: true },
        });
      }
      return existing;
    }

    return tx.customer.create({
      data: {
        reference: await this.nextCustomerReference(tx),
        name: invoice.providerName,
        legalName: invoice.providerName,
        taxId: invoice.providerTaxId,
        address: invoice.providerAddress,
        type: "IMPORTER",
        status: "ACTIVE",
        notes: `Creado automaticamente al importar factura ${invoice.reference}`,
      },
      select: { id: true, name: true, type: true },
    });
  }

  private async findOrCreateInvoiceItem(
    tx: Prisma.TransactionClient,
    invoiceItem: ParsedInvoiceItem,
    importerId: string,
    supplier: string,
    currency: string,
  ) {
    const existing = await tx.inventoryItem.findFirst({
      where: {
        customerId: importerId,
        name: { equals: invoiceItem.description, mode: "insensitive" },
        sourceType: { not: "ARCHIVED" },
      },
      select: { id: true, stock: true },
    });

    if (existing) {
      return existing;
    }

    return tx.inventoryItem.create({
      data: {
        reference: await this.nextReference(tx),
        name: invoiceItem.description,
        unit: invoiceItem.unit,
        stock: 0,
        minStock: 0,
        managedStock: true,
        sourceType: "MATERIAL",
        customerId: importerId,
        supplier,
        supplierCategory: "Importador",
        costPrice: invoiceItem.unitPrice,
        taxAmount: this.roundMoney(invoiceItem.unitPrice * (invoiceItem.taxRate / 100)),
        priceWithTax: this.roundMoney(invoiceItem.unitPrice * (1 + invoiceItem.taxRate / 100)),
        currency,
        notes: "Creado automaticamente desde factura importada",
      },
      select: { id: true, stock: true },
    });
  }

  private async nextCustomerReference(tx: Prisma.TransactionClient) {
    const latest = await tx.customer.findFirst({
      where: { reference: { startsWith: "CLI-" } },
      orderBy: { reference: "desc" },
      select: { reference: true },
    });
    const latestNumber = Number(latest?.reference.replace("CLI-", "") ?? "0");
    const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;
    return `CLI-${String(nextNumber).padStart(4, "0")}`;
  }

  private parseInvoiceDate(value: string) {
    const [day, month, year] = value.replace(/\//g, "-").split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private numberAfterLabel(text: string, label: RegExp) {
    const index = text.search(label);
    if (index < 0) {
      return undefined;
    }
    const rest = text.slice(index).split(/\r?\n/).slice(0, 4).join(" ");
    const numbers = rest.match(/-?\d{1,3}(?:\.\d{3})*(?:,\d+)?|-?\d+(?:[,.]\d+)?/g);
    if (!numbers?.length) {
      return undefined;
    }
    return this.parseLocalNumber(numbers[numbers.length - 1]);
  }

  private firstMatch(text: string, pattern: RegExp) {
    return text.match(pattern)?.[1]?.trim();
  }

  private parseLocalNumber(value: string) {
    const clean = value.trim();
    if (clean.includes(",")) {
      return Number(clean.replace(/\./g, "").replace(",", "."));
    }
    return Number(clean);
  }

  private roundMoney(value: number) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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
      customer: {
        select: {
          id: true,
          name: true,
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
      payment: {
        select: {
          id: true,
          concept: true,
          amount: true,
          currency: true,
          paidAt: true,
        },
      },
    } satisfies Prisma.InventoryMovementInclude;
  }

  private paymentCategoryFromSource(sourceType?: string, movementType?: InventoryMovementType) {
    if (movementType === "OUT") {
      return "STOCK_CONSUMPTION";
    }
    if (sourceType === "ASSET") {
      return "TOOLS";
    }
    if (sourceType === "THIRD_PARTY_SUPPLY") {
      return "SUPPLIES";
    }
    return "MATERIAL_PURCHASE";
  }

  private async nextReference(tx: Prisma.TransactionClient) {
    const lastItem = await tx.inventoryItem.findFirst({
      where: {
        reference: {
          startsWith: "ART-",
        },
      },
      orderBy: {
        reference: "desc",
      },
      select: {
        reference: true,
      },
    });

    const lastNumber = Number(lastItem?.reference.replace("ART-", "")) || 0;
    return `ART-${String(lastNumber + 1).padStart(4, "0")}`;
  }

  private async ensureWorkOrder(tx: Prisma.TransactionClient, id: string) {
    const workOrder = await tx.workOrder.findUnique({ where: { id }, select: { id: true } });
    if (!workOrder) {
      throw new NotFoundException("Work order not found");
    }
  }

  private async ensureCustomer(tx: Prisma.TransactionClient, id: string) {
    const customer = await tx.customer.findUnique({ where: { id }, select: { id: true, name: true, type: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  private async ensureInstalledDevice(tx: Prisma.TransactionClient, id: string) {
    const device = await tx.installedDevice.findUnique({ where: { id }, select: { id: true } });
    if (!device) {
      throw new NotFoundException("Installed device not found");
    }
  }

  private handleDatabaseError(error: unknown): never {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    const message = error instanceof Error ? error.message : "";

    if (code === "P2002") {
      throw new ConflictException("Ya existe un articulo con ese SKU");
    }

    if (message.includes("Can't reach database server") || message.includes("ECONNREFUSED")) {
      throw new ServiceUnavailableException("Base de datos no disponible");
    }

    throw error;
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
