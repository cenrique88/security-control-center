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
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    list(filters?: AuditFilters): Promise<{
        logs: ({
            actor: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
        } & {
            id: string;
            module: string;
            action: string;
            entityType: string;
            entityId: string | null;
            severity: import(".prisma/client").$Enums.AuditSeverity;
            actorId: string | null;
            actorName: string | null;
            summary: string;
            metadata: Prisma.JsonValue | null;
            createdAt: Date;
        })[];
    }>;
    record(input: AuditInput): Promise<void>;
}
export {};
