import { Injectable, Logger } from "@nestjs/common";
import { AuditSeverity, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type AuditInput = {
  module: string;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  severity?: AuditSeverity;
  actorId?: string | null;
  actorName?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
};

type AuditFilters = {
  module?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  limit?: string;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(filters: AuditFilters = {}) {
    const take = Math.min(Math.max(Number(filters.limit) || 80, 1), 200);
    const where: Prisma.AuditLogWhereInput = {
      module: filters.module?.trim() || undefined,
      action: filters.action?.trim() || undefined,
      entityType: filters.entityType?.trim() || undefined,
      entityId: filters.entityId?.trim() || undefined,
    };

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return { logs };
  }

  async record(input: AuditInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          module: input.module,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId === undefined || input.entityId === null ? undefined : String(input.entityId),
          severity: input.severity ?? AuditSeverity.INFO,
          actorId: input.actorId ?? undefined,
          actorName: input.actorName ?? undefined,
          summary: input.summary,
          metadata: input.metadata ?? undefined,
        },
      });
    } catch (error) {
      this.logger.warn(`No se pudo registrar auditoria: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
