import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ServiceType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { CreateInventoryMovementDto } from "./dto/create-inventory-movement.dto";
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
    @Query("mode") mode?: "catalog" | "stock" | "all",
  ) {
    return this.inventoryService.list({ search, category, lowStock, supplier, mode });
  }

  @Get("summary")
  summary() {
    return this.inventoryService.summary();
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

  @Delete("movements/:id")
  deleteMovement(@Param("id") id: string) {
    return this.inventoryService.deleteMovement(id);
  }

  @Delete(":id")
  deleteItem(@Param("id") id: string) {
    return this.inventoryService.deleteItem(id);
  }
}
