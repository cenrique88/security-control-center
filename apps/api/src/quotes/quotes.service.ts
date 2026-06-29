import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuoteDto } from "./dto/create-quote.dto";
import { UpdateQuoteDto } from "./dto/update-quote.dto";

type QuoteFilters = {
  search?: string;
  customerId?: string;
  status?: "ACCEPTED" | "PENDING";
};

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: QuoteFilters) {
    const where: Prisma.QuoteWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status === "ACCEPTED") {
      where.acceptedAt = { not: null };
    }

    if (filters.status === "PENDING") {
      where.acceptedAt = null;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { number: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    return this.prisma.quote.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: this.includeCustomer(),
    });
  }

  async create(dto: CreateQuoteDto) {
    await this.ensureCustomer(dto.customerId);
    const subtotal = Number(dto.subtotal);
    const tax = dto.tax ?? this.roundMoney(subtotal * 0.22);

    return this.prisma.quote.create({
      data: {
        customerId: dto.customerId,
        number: dto.number?.trim() || (await this.nextNumber()),
        title: dto.title.trim(),
        laborPoints: dto.laborPoints ?? 0,
        subtotal,
        tax,
        total: this.roundMoney(subtotal + tax),
      },
      include: this.includeCustomer(),
    });
  }

  async update(id: string, dto: UpdateQuoteDto) {
    const current = await this.prisma.quote.findUnique({ where: { id }, select: { id: true, subtotal: true, tax: true } });
    if (!current) {
      throw new NotFoundException("Quote not found");
    }

    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    const subtotal = dto.subtotal === undefined ? Number(current.subtotal) : Number(dto.subtotal);
    const tax = dto.tax === undefined ? Number(current.tax) : Number(dto.tax);

    return this.prisma.quote.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        number: dto.number?.trim(),
        title: this.cleanOptional(dto.title),
        laborPoints: dto.laborPoints,
        subtotal: dto.subtotal,
        tax: dto.tax,
        total: dto.subtotal !== undefined || dto.tax !== undefined ? this.roundMoney(subtotal + tax) : undefined,
        acceptedAt: dto.acceptedAt === "" ? null : dto.acceptedAt ? new Date(dto.acceptedAt) : undefined,
      },
      include: this.includeCustomer(),
    });
  }

  private includeCustomer() {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    } satisfies Prisma.QuoteInclude;
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async nextNumber() {
    const count = await this.prisma.quote.count();
    return `P-${String(count + 1).padStart(5, "0")}`;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }
}
