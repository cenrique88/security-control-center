import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { SendTraccarCommandDto } from "./dto/send-traccar-command.dto";
import { UpdateTraccarSettingsDto } from "./dto/update-traccar-settings.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehiclesService } from "./vehicles.service";

@Controller("vehicles")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MONITORING)
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

  @Post(":id/traccar/daily/fuel-expense")
  registerDailyFuelExpense(@Param("id") id: string, @Query("date") date?: string) {
    return this.vehiclesService.registerDailyFuelExpense(id, date);
  }

  @Get(":id/traccar/live")
  traccarLive(@Param("id") id: string) {
    return this.vehiclesService.traccarLivePosition(id);
  }

  @Get(":id/traccar/events")
  traccarEvents(@Param("id") id: string, @Query("date") date?: string) {
    return this.vehiclesService.traccarEvents(id, date);
  }

  @Get(":id/traccar/alerts")
  traccarAlertLogs(@Param("id") id: string) {
    return this.vehiclesService.traccarAlertLogs(id);
  }

  @Post(":id/traccar/command")
  sendTraccarCommand(@Param("id") id: string, @Body() dto: SendTraccarCommandDto) {
    return this.vehiclesService.sendTraccarCommand(id, dto);
  }

  @Post(":id/traccar/test-whatsapp")
  sendVehicleTestWhatsApp(@Param("id") id: string) {
    return this.vehiclesService.sendVehicleTestWhatsApp(id);
  }

  @Post(":id/traccar/sync-alerts")
  syncVehicleAlerts(@Param("id") id: string) {
    return this.vehiclesService.syncVehicleAlerts(id);
  }

  @Post(":id/traccar/notifications/configure")
  configureTraccarNotifications(@Param("id") id: string) {
    return this.vehiclesService.configureTraccarNotifications(id);
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
