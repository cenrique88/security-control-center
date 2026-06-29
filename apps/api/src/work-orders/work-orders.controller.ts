import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ServiceType, WorkOrderStatus } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AddWorkOrderMaterialDto } from "./dto/add-work-order-material.dto";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";
import { WorkOrdersService } from "./work-orders.service";

@Controller("work-orders")
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("customerId") customerId?: string,
    @Query("siteId") siteId?: string,
    @Query("type") type?: ServiceType,
    @Query("status") status?: WorkOrderStatus,
  ) {
    return this.workOrdersService.list({ search, customerId, siteId, type, status });
  }

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Post(":id/materials")
  addMaterial(@Param("id") id: string, @Body() dto: AddWorkOrderMaterialDto) {
    return this.workOrdersService.addMaterial(id, dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrdersService.update(id, dto);
  }
}
