import { AuditService } from "./audit.service";
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    list(module?: string, action?: string, entityType?: string, entityId?: string, limit?: string): Promise<{
        logs: ({
            actor: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            module: string;
            action: string;
            entityType: string;
            entityId: string | null;
            severity: import(".prisma/client").$Enums.AuditSeverity;
            actorId: string | null;
            actorName: string | null;
            summary: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    }>;
}
