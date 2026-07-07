import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

type PaymentFilters = {
  search?: string;
  customerId?: string;
  status?: "PAID" | "PENDING" | "OVERDUE";
  type?: "INCOME" | "EXPENSE";
  category?: string;
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: PaymentFilters) {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.type) {
      where.transactionType = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
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
        { category: { contains: query, mode: "insensitive" } },
        { method: { contains: query, mode: "insensitive" } },
        { reference: { contains: query, mode: "insensitive" } },
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
    await this.ensureOptionalLinks(dto);

    return this.prisma.payment.create({
      data: {
        customerId: dto.customerId,
        quoteId: this.cleanOptional(dto.quoteId),
        workOrderId: this.cleanOptional(dto.workOrderId),
        vehicleId: this.cleanOptional(dto.vehicleId),
        transactionType: dto.transactionType ?? "INCOME",
        category: this.cleanOptional(dto.category) ?? "CLIENT_PAYMENT",
        concept: dto.concept.trim(),
        amount: Number(dto.amount),
        currency: this.cleanOptional(dto.currency) ?? "UYU",
        method: this.cleanOptional(dto.method),
        reference: this.cleanOptional(dto.reference),
        notes: this.cleanOptional(dto.notes),
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
    await this.ensureOptionalLinks(dto);

    return this.prisma.payment.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        quoteId: this.cleanNullable(dto.quoteId),
        workOrderId: this.cleanNullable(dto.workOrderId),
        vehicleId: this.cleanNullable(dto.vehicleId),
        transactionType: dto.transactionType,
        category: this.cleanOptional(dto.category),
        concept: this.cleanOptional(dto.concept),
        amount: dto.amount,
        currency: this.cleanOptional(dto.currency),
        method: this.cleanNullable(dto.method),
        reference: this.cleanNullable(dto.reference),
        notes: this.cleanNullable(dto.notes),
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
          type: true,
        },
      },
      quote: { select: { id: true, number: true, title: true, total: true } },
      workOrder: { select: { id: true, title: true, status: true } },
      vehicle: { select: { id: true, name: true, plate: true } },
    } satisfies Prisma.PaymentInclude;
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async ensureOptionalLinks(dto: Pick<CreatePaymentDto, "quoteId" | "workOrderId" | "vehicleId">) {
    if (dto.quoteId) {
      const quote = await this.prisma.quote.findUnique({ where: { id: dto.quoteId }, select: { id: true } });
      if (!quote) {
        throw new NotFoundException("Quote not found");
      }
    }

    if (dto.workOrderId) {
      const workOrder = await this.prisma.workOrder.findUnique({ where: { id: dto.workOrderId }, select: { id: true } });
      if (!workOrder) {
        throw new NotFoundException("Work order not found");
      }
    }

    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId }, select: { id: true } });
      if (!vehicle) {
        throw new NotFoundException("Vehicle not found");
      }
    }
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
