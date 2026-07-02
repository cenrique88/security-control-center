import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CustomersService } from "./customers.service";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
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
    @Query("type") type?: "NORMAL" | "THIRD_PARTY",
  ) {
    return this.customersService.list({ search, status, type });
  }

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Get(":id/profile")
  profile(@Param("id") id: string) {
    return this.customersService.profile(id);
  }

  @Get(":id/sites")
  listSites(@Param("id") id: string) {
    return this.customersService.listSites(id);
  }

  @Post(":id/sites")
  createSite(@Param("id") id: string, @Body() dto: CreateSiteDto) {
    return this.customersService.createSite(id, dto);
  }

  @Post(":id/documents")
  createDocument(@Param("id") id: string, @Body() dto: CreateCustomerDocumentDto) {
    return this.customersService.createDocument(id, dto);
  }

  @Delete(":id/documents/:documentId")
  deleteDocument(@Param("id") id: string, @Param("documentId") documentId: string) {
    return this.customersService.deleteDocument(id, documentId);
  }
}
