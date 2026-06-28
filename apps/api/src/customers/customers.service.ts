import { Injectable, NotFoundException } from "@nestjs/common";
import { CustomerStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

type CustomerFilters = {
  search?: string;
  status?: "ACTIVE" | "PROSPECT" | "INACTIVE";
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: CustomerFilters) {
    const where: Prisma.CustomerWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const query = filters.search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { legalName: { contains: query, mode: "insensitive" } },
        { taxId: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            sites: true,
            workOrders: true,
            quotes: true,
            payments: true,
          },
        },
      },
    });
  }

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: this.toCreateData(dto),
      include: {
        _count: {
          select: {
            sites: true,
            workOrders: true,
            quotes: true,
            payments: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.ensureExists(id);

    return this.prisma.customer.update({
      where: { id },
      data: this.toUpdateData(dto),
      include: {
        _count: {
          select: {
            sites: true,
            workOrders: true,
            quotes: true,
            payments: true,
          },
        },
      },
    });
  }

  async listSites(customerId: string) {
    await this.ensureExists(customerId);

    return this.prisma.site.findMany({
      where: { customerId },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            equipment: true,
            workOrders: true,
          },
        },
      },
    });
  }

  async createSite(customerId: string, dto: CreateSiteDto) {
    await this.ensureExists(customerId);

    return this.prisma.site.create({
      data: {
        customerId,
        name: dto.name.trim(),
        address: dto.address.trim(),
        notes: this.cleanOptional(dto.notes),
      },
      include: {
        _count: {
          select: {
            equipment: true,
            workOrders: true,
          },
        },
      },
    });
  }

  private async ensureExists(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private toCreateData(dto: CreateCustomerDto): Prisma.CustomerCreateInput {
    return {
      name: dto.name.trim(),
      legalName: this.cleanOptional(dto.legalName),
      taxId: this.cleanOptional(dto.taxId),
      email: this.cleanOptional(dto.email),
      phone: this.cleanOptional(dto.phone),
      address: this.cleanOptional(dto.address),
      status: dto.status as CustomerStatus | undefined,
      notes: this.cleanOptional(dto.notes),
    };
  }

  private toUpdateData(dto: UpdateCustomerDto): Prisma.CustomerUpdateInput {
    return {
      name: this.cleanOptional(dto.name),
      legalName: this.cleanNullable(dto.legalName),
      taxId: this.cleanNullable(dto.taxId),
      email: this.cleanNullable(dto.email),
      phone: this.cleanNullable(dto.phone),
      address: this.cleanNullable(dto.address),
      status: dto.status as CustomerStatus | undefined,
      notes: this.cleanNullable(dto.notes),
    };
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }

  private cleanNullable(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const clean = value.trim();
    return clean ? clean : null;
  }
}
