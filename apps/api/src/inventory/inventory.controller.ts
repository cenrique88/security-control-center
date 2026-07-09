import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ServiceType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementBatchDto, CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
import { ImportInvoiceDto } from "./dto/import-invoice.dto";
import { InventoryService } from "./inventory.service";

@Controller("inventory")
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("category") category?: ServiceType,
    @Query("lowStock") lowStock?: string,
    @Query("supplier") supplier?: string,
    @Query("customerId") customerId?: string,
    @Query("sourceType") sourceType?: string,
    @Query("mode") mode?: "catalog" | "stock" | "all" | "archived",
  ) {
    return this.inventoryService.list({ search, category, lowStock, supplier, customerId, sourceType, mode });
  }

  @Get("summary")
  summary() {
    return this.inventoryService.summary();
  }

  @Post("invoice/preview")
  previewInvoice(@Body() dto: ImportInvoiceDto) {
    return this.inventoryService.previewInvoice(dto);
  }

  @Post("invoice/import")
  importInvoice(@Body() dto: ImportInvoiceDto) {
    return this.inventoryService.importInvoice(dto);
  }

  @Post()
  createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Patch(":id")
  updateItem(@Param("id") id: string, @Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Post("movements")
  createMovement(@Body() dto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(dto);
  }

  @Post("movements/batch")
  createMovementBatch(@Body() dto: CreateInventoryMovementBatchDto) {
    return this.inventoryService.createMovementBatch(dto);
  }

  @Delete("movements/:id")
  deleteMovement(@Param("id") id: string) {
    return this.inventoryService.deleteMovement(id);
  }

  @Delete(":id")
  deleteItem(@Param("id") id: string) {
    return this.inventoryService.deleteItem(id);
  }
}
