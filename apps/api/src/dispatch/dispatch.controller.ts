import { Body, Controller, Get, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DispatchService } from "./dispatch.service";
import { SaveDispatchStopsDto } from "./dto/save-dispatch-stops.dto";

@Controller("dispatch")
@UseGuards(JwtAuthGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get("stops")
  listStops(@Query("date") date: string, @Query("vehicleId") vehicleId?: string) {
    return this.dispatchService.list(date, vehicleId);
  }

  @Get("places")
  places() {
    return this.dispatchService.places();
  }

  @Patch("stops")
  saveStops(@Body() dto: SaveDispatchStopsDto) {
    return this.dispatchService.save(dto);
  }

  @Post("traccar/sync")
  syncTraccar(@Query("date") date: string, @Query("vehicleId") vehicleId?: string) {
    return this.dispatchService.syncTraccar(date, vehicleId);
  }

  @Get("suppliers")
  suppliers() {
    return this.dispatchService.suppliers();
  }
}
