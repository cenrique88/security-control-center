import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ServiceType, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { DevicesService } from "./devices.service";
import { CreateDeviceDto } from "./dto/create-device.dto";

@Controller("devices")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.TECHNICIAN)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("customerId") customerId?: string,
    @Query("siteId") siteId?: string,
    @Query("type") type?: ServiceType,
  ) {
    return this.devicesService.list({ search, customerId, siteId, type });
  }

  @Post()
  create(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(dto);
  }
}
