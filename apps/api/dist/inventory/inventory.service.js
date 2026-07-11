"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const node_util_1 = require("node:util");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
let InventoryService = class InventoryService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async list(filters) {
        const where = {};
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
        }
        else {
            where.sourceType = { not: "ARCHIVED" };
        }
        if (filters.sourceType?.trim() && filters.mode !== "archived") {
            where.sourceType = filters.sourceType.trim();
        }
        if (filters.mode === "archived") {
        }
        else if (filters.mode === "catalog") {
            where.managedStock = false;
        }
        else if (filters.mode !== "all") {
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
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async createItem(dto) {
        try {
            const item = await this.prisma.$transaction(async (tx) => {
                const item = await tx.inventoryItem.create({
                    data: {
                        reference: await this.nextReference(tx),
                        sku: this.cleanNullable(dto.sku),
                        name: dto.name.trim(),
                        category: dto.category,
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
                const quantity = Math.trunc(Number(dto.stock) || 0);
                const unitCost = Number(dto.costPrice) || 0;
                const currency = this.cleanOptional(dto.currency) ?? "USD";
                const totalCost = this.roundMoney(quantity * unitCost);
                const financeCustomer = unitCost > 0 ? await this.resolveInventoryFinanceCustomer(tx, dto.customerId, dto.supplier) : null;
                const payment = financeCustomer && quantity > 0 && totalCost > 0
                    ? await tx.payment.create({
                        data: {
                            customerId: financeCustomer.id,
                            inventoryItemId: item.id,
                            transactionType: "EXPENSE",
                            category: this.paymentCategoryFromSource(dto.sourceType, "IN"),
                            concept: `Alta inicial de almacen: ${item.name}`,
                            amount: totalCost,
                            quantity,
                            unitPrice: unitCost,
                            currency,
                            method: "Alta de stock",
                            reference: item.reference,
                            notes: "Generado automaticamente al crear articulo con stock y costo real",
                            paidAt: new Date(),
                        },
                        select: { id: true },
                    })
                    : null;
                if (quantity > 0) {
                    await tx.inventoryMovement.create({
                        data: {
                            itemId: item.id,
                            paymentId: payment?.id,
                            type: "IN",
                            quantity,
                            stockAfter: quantity,
                            unitCost,
                            totalCost: totalCost > 0 ? totalCost : undefined,
                            currency,
                            sourceType: this.cleanOptional(dto.sourceType) ?? "MATERIAL",
                            customerId: financeCustomer?.id ?? this.cleanNullable(dto.customerId),
                            reason: unitCost > 0 ? "Alta inicial de almacen con costo real" : "Alta inicial de almacen sin costo",
                        },
                    });
                }
                return item;
            });
            await this.audit.record({
                module: "INVENTORY",
                action: "ITEM_CREATED",
                entityType: "InventoryItem",
                entityId: item.id,
                severity: Number(item.stock) > 0 ? client_1.AuditSeverity.WARNING : client_1.AuditSeverity.INFO,
                summary: `Articulo creado: ${item.name}`,
                metadata: {
                    reference: item.reference,
                    stock: item.stock,
                    supplier: item.supplier,
                    sourceType: item.sourceType,
                    costPrice: item.costPrice ? Number(item.costPrice) : null,
                    currency: item.currency,
                },
            });
            return item;
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async updateItem(id, dto) {
        const current = await this.prisma.inventoryItem.findUnique({ where: { id }, select: { id: true } });
        if (!current) {
            throw new common_1.NotFoundException("Inventory item not found");
        }
        try {
            const item = await this.prisma.$transaction(async (tx) => {
                const cleanName = dto.name?.trim();
                const item = await tx.inventoryItem.update({
                    where: { id },
                    data: {
                        sku: dto.sku === undefined ? undefined : this.cleanNullable(dto.sku),
                        name: cleanName,
                        category: dto.category === undefined ? undefined : dto.category ? dto.category : null,
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
                if (cleanName) {
                    await tx.quoteItem.updateMany({
                        where: { inventoryItemId: id },
                        data: { description: cleanName },
                    });
                }
                return item;
            });
            await this.audit.record({
                module: "INVENTORY",
                action: "ITEM_UPDATED",
                entityType: "InventoryItem",
                entityId: item.id,
                severity: client_1.AuditSeverity.WARNING,
                summary: `Articulo actualizado: ${item.name}`,
                metadata: {
                    reference: item.reference,
                    stock: item.stock,
                    supplier: item.supplier,
                    sourceType: item.sourceType,
                    costPrice: item.costPrice ? Number(item.costPrice) : null,
                    currency: item.currency,
                },
            });
            return item;
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async createMovement(dto) {
        const movement = await this.prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findUnique({
                where: { id: dto.itemId },
                select: { id: true, name: true, stock: true, costPrice: true, priceWithTax: true, currency: true, customerId: true, supplier: true, sourceType: true },
            });
            if (!item) {
                throw new common_1.NotFoundException("Inventory item not found");
            }
            if (dto.workOrderId) {
                await this.ensureWorkOrder(tx, dto.workOrderId);
            }
            const linkedCustomer = dto.customerId ? await this.ensureCustomer(tx, dto.customerId) : null;
            if (dto.installedDeviceId) {
                await this.ensureInstalledDevice(tx, dto.installedDeviceId);
            }
            const type = dto.type;
            const quantity = dto.quantity;
            const stockAfter = type === "IN" ? item.stock + quantity : type === "OUT" ? item.stock - quantity : quantity;
            const zeroCostRecovery = Boolean(dto.zeroCostRecovery && type === "IN");
            const unitCost = zeroCostRecovery ? 0 : this.resolveMovementUnitCost(dto.unitCost, item.costPrice, item.priceWithTax);
            const totalCost = unitCost && quantity ? unitCost * quantity : undefined;
            const currency = this.cleanOptional(dto.currency) ?? item.currency ?? "UYU";
            if (stockAfter < 0) {
                throw new common_1.BadRequestException("Stock cannot be negative");
            }
            const shouldCreateExpense = Boolean((dto.createExpense && (type === "IN" || type === "OUT")) || (type === "IN" && !zeroCostRecovery && totalCost && totalCost > 0));
            const paymentCategory = this.cleanOptional(dto.paymentCategory) ?? this.paymentCategoryFromSource(dto.sourceType, type);
            const financeCustomer = shouldCreateExpense
                ? await this.resolveMovementFinanceCustomer(tx, {
                    customerId: dto.customerId ?? item.customerId ?? undefined,
                    supplier: item.supplier,
                    movementType: type,
                    paymentCategory,
                })
                : null;
            if (dto.createExpense && !financeCustomer) {
                throw new common_1.BadRequestException("Selecciona una entidad para crear el egreso contable");
            }
            await tx.inventoryItem.update({
                where: { id: item.id },
                data: {
                    stock: stockAfter,
                    managedStock: true,
                    costPrice: unitCost,
                    priceWithTax: zeroCostRecovery ? item.priceWithTax : unitCost,
                    currency,
                    sourceType: this.cleanOptional(dto.sourceType) ?? undefined,
                    customerId: dto.customerId ? dto.customerId : undefined,
                    supplier: linkedCustomer?.type === "IMPORTER" ? linkedCustomer.name : undefined,
                    supplierCategory: linkedCustomer?.type === "IMPORTER" ? "Importador" : undefined,
                },
            });
            const payment = shouldCreateExpense && financeCustomer && totalCost
                ? await tx.payment.create({
                    data: {
                        customerId: financeCustomer.id,
                        workOrderId: this.cleanNullable(dto.workOrderId),
                        inventoryItemId: item.id,
                        transactionType: "EXPENSE",
                        category: paymentCategory,
                        concept: this.cleanOptional(dto.reason) ??
                            (type === "OUT" ? `Consumo de almacen: ${item.name}` : `Compra para almacen: ${item.name}`),
                        amount: totalCost,
                        quantity,
                        unitPrice: unitCost,
                        currency,
                        method: this.cleanOptional(dto.paymentMethod),
                        reference: this.cleanOptional(dto.paymentReference),
                        notes: type === "OUT"
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
                    reason: this.cleanNullable(zeroCostRecovery
                        ? dto.reason || "Reingreso sobrante de obra sin costo - material recuperado"
                        : dto.reason),
                    workOrderId: this.cleanNullable(dto.workOrderId),
                    installedDeviceId: this.cleanNullable(dto.installedDeviceId),
                },
                include: {
                    item: true,
                    ...this.movementInclude(),
                },
            });
        });
        await this.audit.record({
            module: "INVENTORY",
            action: "MOVEMENT_CREATED",
            entityType: "InventoryMovement",
            entityId: movement.id,
            severity: movement.type === "ADJUST" ? client_1.AuditSeverity.CRITICAL : client_1.AuditSeverity.WARNING,
            summary: `${movement.type} ${movement.quantity} ${movement.item.unit} - ${movement.item.name}`,
            metadata: {
                itemId: movement.itemId,
                itemName: movement.item.name,
                type: movement.type,
                quantity: movement.quantity,
                stockAfter: movement.stockAfter,
                totalCost: movement.totalCost ? Number(movement.totalCost) : null,
                currency: movement.currency,
                paymentId: movement.paymentId,
                workOrderId: movement.workOrderId,
                reason: movement.reason,
            },
        });
        return movement;
    }
    async createMovementBatch(dto) {
        const result = await this.prisma.$transaction(async (tx) => {
            if (!dto.items.length) {
                throw new common_1.BadRequestException("Agrega al menos un articulo al movimiento");
            }
            const type = dto.type;
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
                throw new common_1.BadRequestException("Agrega articulos con cantidad mayor a cero");
            }
            const itemIds = [...new Set(normalizedItems.map((item) => item.itemId))];
            if (itemIds.length !== normalizedItems.length) {
                throw new common_1.BadRequestException("No repitas articulos en la misma salida; ajusta la cantidad de una sola linea");
            }
            const dbItems = await tx.inventoryItem.findMany({
                where: { id: { in: itemIds } },
                select: { id: true, name: true, stock: true, costPrice: true, priceWithTax: true, currency: true, customerId: true, supplier: true, sourceType: true },
            });
            const itemById = new Map(dbItems.map((item) => [item.id, item]));
            if (dbItems.length !== itemIds.length) {
                throw new common_1.NotFoundException("Uno o mas articulos no existen");
            }
            const movementLines = normalizedItems.map((line) => {
                const item = itemById.get(line.itemId);
                const quantity = line.quantity;
                const stockAfter = type === "IN" ? item.stock + quantity : type === "OUT" ? item.stock - quantity : quantity;
                if (stockAfter < 0) {
                    throw new common_1.BadRequestException(`Stock insuficiente para ${item.name}. Disponible: ${item.stock}`);
                }
                const zeroCostRecovery = Boolean(dto.zeroCostRecovery && type === "IN");
                const unitCost = zeroCostRecovery ? 0 : this.resolveMovementUnitCost(line.unitCost, item.costPrice, item.priceWithTax);
                const totalCost = unitCost && quantity ? unitCost * quantity : undefined;
                const currency = this.cleanOptional(line.currency) ?? this.cleanOptional(dto.currency) ?? item.currency ?? "UYU";
                return { line, item, quantity, stockAfter, unitCost, totalCost, currency };
            });
            const batchTotal = movementLines.reduce((total, line) => total + (line.totalCost ?? 0), 0);
            const currency = movementLines[0]?.currency ?? this.cleanOptional(dto.currency) ?? "UYU";
            const reason = this.cleanOptional(dto.reason);
            const shouldCreateExpense = Boolean((dto.createExpense && (type === "IN" || type === "OUT")) || (type === "IN" && !dto.zeroCostRecovery && batchTotal > 0));
            const paymentCategory = this.cleanOptional(dto.paymentCategory) ?? this.paymentCategoryFromSource(dto.sourceType, type);
            const financeCustomer = shouldCreateExpense
                ? await this.resolveMovementFinanceCustomer(tx, {
                    customerId: dto.customerId ?? movementLines.find((line) => line.item.customerId)?.item.customerId ?? undefined,
                    supplier: movementLines.find((line) => line.item.supplier)?.item.supplier,
                    movementType: type,
                    paymentCategory,
                })
                : null;
            if (dto.createExpense && !financeCustomer) {
                throw new common_1.BadRequestException("Selecciona una entidad para crear el egreso contable");
            }
            const payment = shouldCreateExpense && financeCustomer && batchTotal > 0
                ? await tx.payment.create({
                    data: {
                        customerId: financeCustomer.id,
                        workOrderId: this.cleanNullable(dto.workOrderId),
                        transactionType: "EXPENSE",
                        category: paymentCategory,
                        concept: reason ??
                            (type === "OUT"
                                ? `Salida de almacen: ${movementLines.length} articulos`
                                : `Entrada de almacen: ${movementLines.length} articulos`),
                        amount: batchTotal,
                        quantity: movementLines.reduce((total, line) => total + line.quantity, 0),
                        currency,
                        method: this.cleanOptional(dto.paymentMethod),
                        reference: this.cleanOptional(dto.paymentReference),
                        notes: type === "OUT"
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
                        priceWithTax: dto.zeroCostRecovery && type === "IN" ? movement.item.priceWithTax : movement.unitCost,
                        currency: movement.currency,
                        sourceType: this.cleanOptional(dto.sourceType ?? movement.line.sourceType) ?? undefined,
                        customerId: dto.customerId ? dto.customerId : undefined,
                        supplier: linkedCustomer?.type === "IMPORTER" ? linkedCustomer.name : undefined,
                        supplierCategory: linkedCustomer?.type === "IMPORTER" ? "Importador" : undefined,
                    },
                });
                createdMovements.push(await tx.inventoryMovement.create({
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
                        reason: this.cleanNullable(dto.zeroCostRecovery && type === "IN"
                            ? reason || "Reingreso sobrante de obra sin costo - material recuperado"
                            : reason),
                        workOrderId: this.cleanNullable(dto.workOrderId),
                        installedDeviceId: this.cleanNullable(dto.installedDeviceId),
                    },
                    include: {
                        item: true,
                        ...this.movementInclude(),
                    },
                }));
            }
            return { paymentId: payment?.id ?? null, movements: createdMovements };
        });
        await this.audit.record({
            module: "INVENTORY",
            action: "MOVEMENT_BATCH_CREATED",
            entityType: "InventoryMovement",
            entityId: result.paymentId ?? result.movements[0]?.id,
            severity: client_1.AuditSeverity.WARNING,
            summary: `Movimiento agrupado: ${result.movements.length} articulo(s)`,
            metadata: {
                paymentId: result.paymentId,
                movementIds: result.movements.map((movement) => movement.id),
                type: dto.type,
                reason: dto.reason,
                totalQuantity: result.movements.reduce((total, movement) => total + movement.quantity, 0),
            },
        });
        return result;
    }
    async deleteMovement(id) {
        const movement = await this.prisma.$transaction(async (tx) => {
            const movement = await tx.inventoryMovement.findUnique({
                where: { id },
                include: { item: true },
            });
            if (!movement) {
                throw new common_1.NotFoundException("Inventory movement not found");
            }
            const stockAfterDelete = movement.type === "OUT"
                ? movement.item.stock + movement.quantity
                : movement.type === "IN"
                    ? movement.item.stock - movement.quantity
                    : movement.item.stock;
            if (stockAfterDelete < 0) {
                throw new common_1.BadRequestException("Stock cannot be negative");
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
        await this.audit.record({
            module: "INVENTORY",
            action: "MOVEMENT_DELETED",
            entityType: "InventoryMovement",
            entityId: movement.id,
            severity: client_1.AuditSeverity.CRITICAL,
            summary: `Movimiento eliminado: ${movement.type} ${movement.quantity} - ${movement.item.name}`,
            metadata: {
                itemId: movement.itemId,
                itemName: movement.item.name,
                type: movement.type,
                quantity: movement.quantity,
                stockAfter: movement.stockAfter,
                paymentId: movement.paymentId,
                workOrderId: movement.workOrderId,
            },
        });
        return movement;
    }
    async deleteItem(id) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            select: {
                id: true,
                reference: true,
                name: true,
                stock: true,
                supplier: true,
                sourceType: true,
                _count: {
                    select: { movements: true },
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException("Inventory item not found");
        }
        if (item._count.movements > 0) {
            const archived = await this.prisma.inventoryItem.update({
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
            await this.audit.record({
                module: "INVENTORY",
                action: "ITEM_ARCHIVED",
                entityType: "InventoryItem",
                entityId: archived.id,
                severity: client_1.AuditSeverity.CRITICAL,
                summary: `Articulo archivado: ${archived.name}`,
                metadata: {
                    reference: archived.reference,
                    previousStock: item.stock,
                    supplier: item.supplier,
                    sourceType: item.sourceType,
                    movements: item._count.movements,
                },
            });
            return archived;
        }
        const deleted = await this.prisma.inventoryItem.delete({ where: { id } });
        await this.audit.record({
            module: "INVENTORY",
            action: "ITEM_DELETED",
            entityType: "InventoryItem",
            entityId: deleted.id,
            severity: client_1.AuditSeverity.CRITICAL,
            summary: `Articulo eliminado: ${deleted.name}`,
            metadata: {
                reference: deleted.reference,
                stock: item.stock,
                supplier: item.supplier,
                sourceType: item.sourceType,
            },
        });
        return deleted;
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
    async previewInvoice(dto) {
        const text = await this.extractInvoiceText(dto.dataUrl);
        const preview = this.parseInvoiceText(text, dto.fileName);
        return this.withInvoiceDuplicateStatus(preview);
    }
    async importInvoice(dto) {
        const preview = await this.previewInvoice(dto);
        if (!preview.items.length) {
            throw new common_1.BadRequestException("No se encontraron materiales en la factura");
        }
        if (preview.duplicate?.exists) {
            throw new common_1.ConflictException(preview.duplicate.message);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const importer = await this.findOrCreateImporter(tx, preview);
            const importMode = dto.importMode === "EXPENSE" || dto.createStockEntries === false ? "EXPENSE" : "STOCK";
            if (importMode === "EXPENSE") {
                const payment = await tx.payment.create({
                    data: {
                        customerId: importer.id,
                        transactionType: "EXPENSE",
                        category: "OTHER_EXPENSE",
                        concept: `Gasto factura ${preview.reference} - ${preview.providerName}`,
                        amount: preview.totals.total,
                        currency: preview.currency,
                        method: "Factura",
                        reference: preview.reference,
                        notes: [
                            `Importado automaticamente como gasto operativo desde ${dto.fileName || "PDF"}.`,
                            `Subtotal ${preview.totals.subtotal}, IVA ${preview.totals.tax}.`,
                            preview.items.length ? `Detalle: ${preview.items.map((item) => `${item.description} x${item.quantity}`).join("; ")}` : "",
                        ]
                            .filter(Boolean)
                            .join(" "),
                        paidAt: preview.date ? this.parseInvoiceDate(preview.date) : new Date(),
                    },
                    select: { id: true },
                });
                return {
                    importer,
                    paymentId: payment.id,
                    movements: [],
                    invoice: preview,
                    importMode,
                };
            }
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
                movements.push(await tx.inventoryMovement.create({
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
                }));
            }
            return {
                importer,
                paymentId: payment.id,
                movements,
                invoice: preview,
            };
        });
        await this.audit.record({
            module: "INVENTORY",
            action: "INVOICE_IMPORTED",
            entityType: "Payment",
            entityId: result.paymentId,
            severity: client_1.AuditSeverity.WARNING,
            summary: `Factura importada: ${preview.reference} - ${preview.providerName}`,
            metadata: {
                providerName: preview.providerName,
                providerTaxId: preview.providerTaxId,
                reference: preview.reference,
                importMode: "importMode" in result ? result.importMode : "STOCK",
                amount: preview.totals.total,
                currency: preview.currency,
                itemCount: preview.items.length,
                movementCount: result.movements.length,
            },
        });
        return result;
    }
    async withInvoiceDuplicateStatus(preview) {
        const duplicate = await this.findDuplicateInvoice(preview);
        return {
            ...preview,
            duplicate: duplicate ?? {
                exists: false,
                message: "Factura sin importacion previa detectada.",
                products: [],
            },
        };
    }
    async findDuplicateInvoice(preview) {
        const reference = this.cleanOptional(preview.reference);
        if (!reference) {
            return null;
        }
        const importer = await this.prisma.customer.findFirst({
            where: preview.providerTaxId
                ? { taxId: preview.providerTaxId }
                : { name: { equals: preview.providerName, mode: "insensitive" } },
            select: { id: true },
        });
        const payment = await this.prisma.payment.findFirst({
            where: {
                transactionType: "EXPENSE",
                reference,
                ...(importer ? { customerId: importer.id } : {}),
            },
            orderBy: { createdAt: "desc" },
            include: {
                inventoryMovements: {
                    include: {
                        item: { select: { name: true, sku: true } },
                    },
                },
            },
        });
        if (payment) {
            const products = payment.inventoryMovements.map((movement) => [movement.item.name, movement.item.sku ? `SKU ${movement.item.sku}` : "", `${movement.quantity} u`].filter(Boolean).join(" - "));
            const detail = products.length ? ` Los productos ya se agregaron al almacen: ${products.join("; ")}.` : " Ya fue registrada como gasto operativo.";
            return {
                exists: true,
                paymentId: payment.id,
                importedAt: payment.createdAt.toISOString(),
                message: `La factura ${reference} ya fue importada.${detail}`,
                products,
            };
        }
        const movements = await this.prisma.inventoryMovement.findMany({
            where: {
                type: "IN",
                reason: { equals: `Factura ${reference}` },
                ...(importer ? { customerId: importer.id } : {}),
            },
            include: {
                item: { select: { name: true, sku: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        if (!movements.length) {
            return null;
        }
        const products = movements.map((movement) => [movement.item.name, movement.item.sku ? `SKU ${movement.item.sku}` : "", `${movement.quantity} u`].filter(Boolean).join(" - "));
        return {
            exists: true,
            importedAt: movements[0]?.createdAt.toISOString(),
            message: `La factura ${reference} ya tiene entradas de almacen registradas. Productos agregados: ${products.join("; ")}.`,
            products,
        };
    }
    async installedQuantityByItem(itemIds) {
        if (!itemIds.length) {
            return new Map();
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
    async extractInvoiceText(dataUrl) {
        const match = dataUrl.match(/^data:application\/pdf(?:;[^,]*)?;base64,(.+)$/);
        if (!match) {
            throw new common_1.BadRequestException("Adjunta una factura PDF valida");
        }
        const buffer = Buffer.from(match[1], "base64");
        if (!buffer.length) {
            throw new common_1.BadRequestException("El PDF esta vacio");
        }
        const dir = (0, node_path_1.join)((0, node_os_1.tmpdir)(), "sscc-invoices");
        await (0, promises_1.mkdir)(dir, { recursive: true });
        const filePath = (0, node_path_1.join)(dir, `invoice-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`);
        await (0, promises_1.writeFile)(filePath, buffer);
        try {
            const scriptPath = (0, node_path_1.resolve)(__dirname, "..", "..", "scripts", "extract_invoice_text.py");
            const { stdout } = await this.runPython(scriptPath, filePath);
            const parsed = JSON.parse(stdout);
            if (parsed.error) {
                throw new common_1.BadRequestException(parsed.error);
            }
            return parsed.text || "";
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo leer el PDF";
            throw new common_1.BadRequestException(`No se pudo leer la factura PDF: ${message}`);
        }
        finally {
            await (0, promises_1.unlink)(filePath).catch(() => undefined);
        }
    }
    async runPython(scriptPath, filePath) {
        const candidates = [
            process.env.PYTHON_BIN,
            process.env.PYTHON_PATH,
            process.env.LOCALAPPDATA ? (0, node_path_1.join)(process.env.LOCALAPPDATA, "Programs", "Python", "Python312", "python.exe") : undefined,
            "python",
            "py",
        ].filter(Boolean);
        let lastError;
        for (const candidate of candidates) {
            try {
                return await execFileAsync(candidate, [scriptPath, filePath], {
                    maxBuffer: 1024 * 1024 * 10,
                });
            }
            catch (error) {
                lastError = error;
            }
        }
        throw lastError instanceof Error ? lastError : new Error("Python no disponible");
    }
    parseInvoiceText(text, fileName) {
        const lines = text
            .split(/\r?\n/)
            .map((line) => line.replace(/\s+/g, " ").trim())
            .filter(Boolean);
        const providerName = this.findProviderName(lines) || "Proveedor sin identificar";
        const rutIndex = lines.findIndex((line) => /R\.?U\.?T\.?/i.test(line));
        const providerAddress = rutIndex > 1 ? lines.slice(1, rutIndex).join(", ") : undefined;
        const providerTaxId = this.firstMatch(text, /R\.?U\.?T\.?\s*(\d{8,14})/i) || this.firstMatch(text, /RUT[^\n]*\n(\d{8,14})/i);
        const buyerName = this.firstMatch(text, /Cliente\s+(.+?)(?:\s+Doc\.|\n|$)/i) ||
            lines.find((line) => /Security Solutions|Solutions/i.test(line) && !line.includes(providerName));
        const date = this.firstMatch(text, /Fecha\s+(\d{2}[-/]\d{2}[-/]\d{4})/i) || this.firstMatch(text, /Fecha\s+Moneda\s*\n(\d{2}[-/]\d{2}[-/]\d{4})/i);
        const currency = this.firstMatch(text, /Moneda\s+([A-Z]{3})/i) ||
            this.firstMatch(text, /Fecha\s+Moneda\s*\n\d{2}[-/]\d{2}[-/]\d{4}\s+([A-Z]{3})/i) ||
            "UYU";
        const invoiceType = this.firstMatch(text, /Tipo CFE\s+([^\n]+)/i) ||
            this.firstMatch(text, /RUT\s+TIPO DE DOCUMENTO\s*\n\d{8,14}\s+([^\n]+)/i) ||
            this.firstMatch(text, /\b(eFactura|e-Ticket|Factura)\b/i);
        const series = this.firstMatch(text, /Serie\s+([A-Z]+)/i) || this.firstMatch(text, /SERIE\s+NUMERO[^\n]*\n([A-Z]+)/i);
        const number = this.firstMatch(text, /N[uú]mero\s+(\d+)/i) || this.firstMatch(text, /SERIE\s+NUMERO[^\n]*\n[A-Z]+\s+(\d+)/i);
        const reference = [series, number].filter(Boolean).join("-") || fileName || `FACT-${Date.now()}`;
        const items = this.parseInvoiceItems(lines);
        const itemsSubtotal = this.roundMoney(items.reduce((total, item) => total + item.subtotal, 0));
        const extractedSubtotal = this.numberAfterLabel(text, /Subtotal\s+gravado\s+22%/i);
        const subtotal = this.roundMoney(extractedSubtotal && extractedSubtotal >= itemsSubtotal * 0.5 ? extractedSubtotal : itemsSubtotal);
        const extractedTax = this.numberAfterLabel(text, /I\.?V\.?A\.?\s+22%/i);
        const tax = this.roundMoney(extractedTax && extractedTax >= 0 ? extractedTax : subtotal * 0.22);
        const extractedTotal = this.numberAfterLabel(text, /Monto\s+Total|Total:/i);
        const total = this.roundMoney(extractedTotal && extractedTotal >= subtotal * 0.5 ? extractedTotal : subtotal + tax);
        const warnings = [];
        if (!text.trim()) {
            warnings.push("El PDF no contiene texto legible. Parece un escaneo o una imagen dentro del PDF; para leerlo automaticamente hace falta OCR.");
        }
        else if (!items.length) {
            warnings.push("Se pudo leer texto del PDF, pero no se encontraron lineas de articulos con cantidad y precio. Puede ser un formato de factura distinto.");
        }
        if (extractedTotal !== undefined && extractedTotal < subtotal * 0.5) {
            warnings.push(`El total leido (${extractedTotal}) no coincide con los articulos detectados. Se uso el total calculado por productos: ${total}.`);
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
    parseInvoiceItems(lines) {
        const items = [];
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
    findProviderName(lines) {
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
    async findOrCreateImporter(tx, invoice) {
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
    async resolveInventoryFinanceCustomer(tx, customerId, supplier) {
        const cleanCustomerId = this.cleanOptional(customerId);
        if (cleanCustomerId) {
            const customer = await tx.customer.findUnique({
                where: { id: cleanCustomerId },
                select: { id: true, name: true, type: true },
            });
            if (customer) {
                return customer;
            }
        }
        const name = this.cleanOptional(supplier ?? undefined) ?? "Almacen SS - Importador";
        const existing = await tx.customer.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
            select: { id: true, name: true, type: true },
        });
        if (existing) {
            if (existing.type !== "IMPORTER") {
                return tx.customer.update({
                    where: { id: existing.id },
                    data: { type: "IMPORTER", status: "ACTIVE" },
                    select: { id: true, name: true, type: true },
                });
            }
            return existing;
        }
        return tx.customer.create({
            data: {
                reference: await this.nextCustomerReference(tx),
                name,
                legalName: name,
                type: "IMPORTER",
                status: "ACTIVE",
                notes: "Creado automaticamente para vincular egresos de almacen a Finanzas",
            },
            select: { id: true, name: true, type: true },
        });
    }
    async resolveMovementFinanceCustomer(tx, input) {
        const explicitCustomerId = this.cleanOptional(input.customerId);
        const isInternalConsumption = input.movementType === "OUT" && (input.paymentCategory ?? "STOCK_CONSUMPTION") === "STOCK_CONSUMPTION";
        if (isInternalConsumption && !explicitCustomerId) {
            return this.resolveInternalOperationsCustomer(tx);
        }
        return this.resolveInventoryFinanceCustomer(tx, explicitCustomerId, input.supplier);
    }
    async resolveInternalOperationsCustomer(tx) {
        const name = "Security Solutions - Operativo";
        const existing = await tx.customer.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
            select: { id: true, name: true, type: true },
        });
        if (existing) {
            if (existing.type !== "INTERNAL") {
                return tx.customer.update({
                    where: { id: existing.id },
                    data: { type: "INTERNAL", status: "ACTIVE" },
                    select: { id: true, name: true, type: true },
                });
            }
            return existing;
        }
        return tx.customer.create({
            data: {
                reference: await this.nextCustomerReference(tx),
                name,
                legalName: name,
                type: "INTERNAL",
                status: "ACTIVE",
                notes: "Entidad interna para gastos operativos sin cliente ni orden vinculada.",
            },
            select: { id: true, name: true, type: true },
        });
    }
    async findOrCreateInvoiceItem(tx, invoiceItem, importerId, supplier, currency) {
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
    async nextCustomerReference(tx) {
        const latest = await tx.customer.findFirst({
            where: { reference: { startsWith: "CLI-" } },
            orderBy: { reference: "desc" },
            select: { reference: true },
        });
        const latestNumber = Number(latest?.reference.replace("CLI-", "") ?? "0");
        const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;
        return `CLI-${String(nextNumber).padStart(4, "0")}`;
    }
    parseInvoiceDate(value) {
        const [day, month, year] = value.replace(/\//g, "-").split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    numberAfterLabel(text, label) {
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
    firstMatch(text, pattern) {
        return text.match(pattern)?.[1]?.trim();
    }
    parseLocalNumber(value) {
        const clean = value.trim();
        if (clean.includes(",")) {
            return Number(clean.replace(/\./g, "").replace(",", "."));
        }
        return Number(clean);
    }
    roundMoney(value) {
        return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    }
    resolveMovementUnitCost(value, fallbackCost, fallbackPrice) {
        if (value !== undefined && value !== null && Number.isFinite(Number(value))) {
            return Number(value);
        }
        return Number(fallbackCost ?? fallbackPrice) || undefined;
    }
    movementInclude() {
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
        };
    }
    paymentCategoryFromSource(sourceType, movementType) {
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
    async nextReference(tx) {
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
    async ensureWorkOrder(tx, id) {
        const workOrder = await tx.workOrder.findUnique({ where: { id }, select: { id: true } });
        if (!workOrder) {
            throw new common_1.NotFoundException("Work order not found");
        }
    }
    async ensureCustomer(tx, id) {
        const customer = await tx.customer.findUnique({ where: { id }, select: { id: true, name: true, type: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
        return customer;
    }
    async ensureInstalledDevice(tx, id) {
        const device = await tx.installedDevice.findUnique({ where: { id }, select: { id: true } });
        if (!device) {
            throw new common_1.NotFoundException("Installed device not found");
        }
    }
    handleDatabaseError(error) {
        const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
        const message = error instanceof Error ? error.message : "";
        if (code === "P2002") {
            throw new common_1.ConflictException("Ya existe un articulo con ese SKU");
        }
        if (message.includes("Can't reach database server") || message.includes("ECONNREFUSED")) {
            throw new common_1.ServiceUnavailableException("Base de datos no disponible");
        }
        throw error;
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
    cleanNullable(value) {
        if (value === undefined) {
            return undefined;
        }
        const clean = value.trim();
        return clean ? clean : null;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map