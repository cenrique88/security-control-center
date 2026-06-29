import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateQuoteDto } from "./dto/create-quote.dto";
import { UpdateQuoteDto } from "./dto/update-quote.dto";
import { QuotesService } from "./quotes.service";

@Controller("quotes")
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("customerId") customerId?: string,
    @Query("status") status?: "ACCEPTED" | "PENDING",
  ) {
    return this.quotesService.list({ search, customerId, status });
  }

  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, dto);
  }
}
