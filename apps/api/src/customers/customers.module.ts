import { Module } from "@nestjs/common";
import { VehiclesModule } from "../vehicles/vehicles.module";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";

@Module({
  imports: [VehiclesModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
