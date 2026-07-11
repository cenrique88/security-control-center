"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filters = {}) {
        const take = Math.min(Math.max(Number(filters.limit) || 80, 1), 200);
        const where = {
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
    async record(input) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    module: input.module,
                    action: input.action,
                    entityType: input.entityType,
                    entityId: input.entityId === undefined || input.entityId === null ? undefined : String(input.entityId),
                    severity: input.severity ?? client_1.AuditSeverity.INFO,
                    actorId: input.actorId ?? undefined,
                    actorName: input.actorName ?? undefined,
                    summary: input.summary,
                    metadata: input.metadata ?? undefined,
                },
            });
        }
        catch (error) {
            this.logger.warn(`No se pudo registrar auditoria: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map