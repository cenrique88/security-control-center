import { Injectable, NotFoundException } from "@nestjs/common";
import { CustomerStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
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
        { reference: { contains: query, mode: "insensitive" } },
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
      data: {
        ...this.toCreateData(dto),
        reference: await this.nextCustomerReference(),
      },
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

  async profile(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sites: true,
            workOrders: true,
            quotes: true,
            payments: true,
          },
        },
        sites: {
          orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
          include: {
            _count: {
              select: {
                equipment: true,
                workOrders: true,
              },
            },
          },
        },
        workOrders: {
          orderBy: [{ scheduledAt: "desc" }, { updatedAt: "desc" }],
          include: {
            site: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            inventoryMovements: {
              orderBy: { createdAt: "desc" },
              include: {
                item: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                    unit: true,
                  },
                },
                installedDevice: {
                  select: {
                    id: true,
                    brand: true,
                    model: true,
                    serial: true,
                    ipAddress: true,
                  },
                },
              },
            },
          },
        },
        quotes: {
          orderBy: [{ updatedAt: "desc" }],
          take: 8,
        },
        payments: {
          orderBy: [{ dueDate: "desc" }, { updatedAt: "desc" }],
          take: 8,
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    const equipment = await this.prisma.installedDevice.findMany({
      where: {
        site: { customerId: id },
        inventoryMovements: {
          some: {
            workOrderId: { not: null },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        inventoryMovements: {
          where: { workOrderId: { not: null } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            workOrderId: true,
            createdAt: true,
            workOrder: {
              select: {
                id: true,
                title: true,
                status: true,
                scheduledAt: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    return {
      customer,
      sites: customer.sites,
      workOrders: customer.workOrders,
      equipment,
      quotes: customer.quotes,
      payments: customer.payments,
      documents: customer.documents,
    };
  }

  async createDocument(customerId: string, dto: CreateCustomerDocumentDto) {
    await this.ensureExists(customerId);

    return this.prisma.customerDocument.create({
      data: {
        customerId,
        name: dto.name.trim(),
        mimeType: this.cleanOptional(dto.mimeType),
        size: dto.size,
        dataUrl: dto.dataUrl,
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

  private toCreateData(dto: CreateCustomerDto): Omit<Prisma.CustomerCreateInput, "reference"> {
    return {
      name: dto.name.trim(),
      legalName: this.cleanOptional(dto.legalName),
      taxId: this.cleanOptional(dto.taxId),
      email: this.cleanOptional(dto.email),
      phone: this.cleanOptional(dto.phone),
      address: this.cleanOptional(dto.address),
      logoUrl: this.cleanOptional(dto.logoUrl),
      status: dto.status as CustomerStatus | undefined,
      notes: this.cleanOptional(dto.notes),
    };
  }

  private async nextCustomerReference() {
    const latest = await this.prisma.customer.findFirst({
      where: {
        reference: {
          startsWith: "CLI-",
        },
      },
      orderBy: {
        reference: "desc",
      },
      select: {
        reference: true,
      },
    });

    const latestNumber = Number(latest?.reference.replace("CLI-", "") ?? "0");
    const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;
    return `CLI-${String(nextNumber).padStart(4, "0")}`;
  }

  private toUpdateData(dto: UpdateCustomerDto): Prisma.CustomerUpdateInput {
    return {
      name: this.cleanOptional(dto.name),
      legalName: this.cleanNullable(dto.legalName),
      taxId: this.cleanNullable(dto.taxId),
      email: this.cleanNullable(dto.email),
      phone: this.cleanNullable(dto.phone),
      address: this.cleanNullable(dto.address),
      logoUrl: this.cleanNullable(dto.logoUrl),
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
