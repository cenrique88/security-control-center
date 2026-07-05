import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateTraccarSettingsDto } from "./dto/update-traccar-settings.dto";
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

  @Get("traccar/settings")
  getTraccarSettings() {
    return this.vehiclesService.getTraccarSettings();
  }

  @Patch("traccar/settings")
  updateTraccarSettings(@Body() dto: UpdateTraccarSettingsDto) {
    return this.vehiclesService.updateTraccarSettings(dto);
  }

  @Post("traccar/geofences/sync")
  syncTraccarGeofences() {
    return this.vehiclesService.syncCustomerGeofences();
  }

  @Get(":id/traccar/daily")
  traccarDaily(@Param("id") id: string, @Query("date") date?: string) {
    return this.vehiclesService.traccarDailySummary(id, date);
  }

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.vehiclesService.remove(id);
  }
}
