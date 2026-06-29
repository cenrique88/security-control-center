import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

type PaymentFilters = {
  search?: string;
  customerId?: string;
  status?: "PAID" | "PENDING" | "OVERDUE";
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: PaymentFilters) {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status === "PAID") {
      where.paidAt = { not: null };
    }

    if (filters.status === "PENDING") {
      where.paidAt = null;
    }

    if (filters.status === "OVERDUE") {
      where.paidAt = null;
      where.dueDate = { lt: new Date() };
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { concept: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: [{ paidAt: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: this.includeCustomer(),
    });
  }

  async create(dto: CreatePaymentDto) {
    await this.ensureCustomer(dto.customerId);

    return this.prisma.payment.create({
      data: {
        customerId: dto.customerId,
        concept: dto.concept.trim(),
        amount: Number(dto.amount),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
      include: this.includeCustomer(),
    });
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const current = await this.prisma.payment.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Payment not found");
    }

    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        concept: this.cleanOptional(dto.concept),
        amount: dto.amount,
        dueDate: dto.dueDate === "" ? null : dto.dueDate ? new Date(dto.dueDate) : undefined,
        paidAt: dto.paidAt === "" ? null : dto.paidAt ? new Date(dto.paidAt) : undefined,
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
    } satisfies Prisma.PaymentInclude;
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }
}
