import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("customerId") customerId?: string,
    @Query("status") status?: "PAID" | "PENDING" | "OVERDUE",
  ) {
    return this.paymentsService.list({ search, customerId, status });
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }
}
