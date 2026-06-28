import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("status") status?: "ACTIVE" | "PROSPECT" | "INACTIVE",
  ) {
    return this.customersService.list({ search, status });
  }

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Get(":id/sites")
  listSites(@Param("id") id: string) {
    return this.customersService.listSites(id);
  }

  @Post(":id/sites")
  createSite(@Param("id") id: string, @Body() dto: CreateSiteDto) {
    return this.customersService.createSite(id, dto);
  }
}
