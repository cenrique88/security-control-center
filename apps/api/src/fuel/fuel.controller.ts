import { Controller, Get } from "@nestjs/common";
import { FuelService } from "./fuel.service";

@Controller("fuel")
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get("uy-super")
  getUruguaySuper() {
    return this.fuelService.getUruguaySuperPrice();
  }
}
