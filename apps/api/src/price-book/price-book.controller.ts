import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { QuoteItemType, ServiceType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateLaborPointRateDto } from "./dto/update-labor-point-rate.dto";
import { UpsertCustomerLaborPointRateDto } from "./dto/upsert-customer-labor-point-rate.dto";
import { UpsertCustomerPriceOverrideDto } from "./dto/upsert-customer-price-override.dto";
import { UpsertPriceBookItemDto } from "./dto/upsert-price-book-item.dto";
import { PriceBookService } from "./price-book.service";

@Controller("price-book")
@UseGuards(JwtAuthGuard)
export class PriceBookController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("service") service?: ServiceType,
    @Query("type") type?: QuoteItemType,
    @Query("active") active?: string,
  ) {
    return this.priceBookService.list({ search, category, service, type, active });
  }

  @Post()
  create(@Body() dto: UpsertPriceBookItemDto) {
    return this.priceBookService.create(dto);
  }

  @Get("labor-points")
  laborRates(@Query("customerId") customerId?: string) {
    return this.priceBookService.laborRates(customerId);
  }

  @Get("labor-points/calculate")
  calculateLaborPoints(@Query("points") points?: string, @Query("rateId") rateId?: string, @Query("customerId") customerId?: string) {
    return this.priceBookService.calculateLaborPoints(Number(points) || 0, rateId, customerId);
  }

  @Patch("labor-points/:id")
  updateLaborRate(@Param("id") id: string, @Body() dto: UpdateLaborPointRateDto) {
    return this.priceBookService.updateLaborRate(id, dto);
  }

  @Get("customer-labor-rates")
  customerLaborRates(@Query("customerId") customerId?: string) {
    return this.priceBookService.customerLaborRates(customerId);
  }

  @Post("customer-labor-rates")
  createCustomerLaborRate(@Body() dto: UpsertCustomerLaborPointRateDto) {
    return this.priceBookService.createCustomerLaborRate(dto);
  }

  @Patch("customer-labor-rates/:id")
  updateCustomerLaborRate(@Param("id") id: string, @Body() dto: UpsertCustomerLaborPointRateDto) {
    return this.priceBookService.updateCustomerLaborRate(id, dto);
  }

  @Get("customer-price-overrides")
  customerPriceOverrides(@Query("customerId") customerId?: string) {
    return this.priceBookService.customerPriceOverrides(customerId);
  }

  @Post("customer-price-overrides")
  upsertCustomerPriceOverride(@Body() dto: UpsertCustomerPriceOverrideDto) {
    return this.priceBookService.upsertCustomerPriceOverride(dto);
  }

  @Patch("customer-price-overrides/:id")
  updateCustomerPriceOverride(@Param("id") id: string, @Body() dto: UpsertCustomerPriceOverrideDto) {
    return this.priceBookService.updateCustomerPriceOverride(id, dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpsertPriceBookItemDto) {
    return this.priceBookService.update(id, dto);
  }
}
