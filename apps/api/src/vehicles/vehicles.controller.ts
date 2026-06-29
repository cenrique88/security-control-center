import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehiclesService } from "./vehicles.service";

@Controller("vehicles")
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  list(@Query("search") search?: string, @Query("active") active?: string) {
    return this.vehiclesService.list({
      search,
      active: active === undefined ? undefined : active === "true",
    });
  }

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }
}
