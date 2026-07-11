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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list() {
        return this.prisma.user.findMany({
            orderBy: [{ role: "asc" }, { name: "asc" }],
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
        if (existing) {
            throw new common_1.ConflictException("Email already registered");
        }
        const user = await this.prisma.user.create({
            data: {
                name: dto.name.trim(),
                email: dto.email.trim().toLowerCase(),
                passwordHash: await (0, bcryptjs_1.hash)(dto.password, 12),
                role: dto.role ?? client_1.UserRole.TECHNICIAN,
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });
        await this.audit.record({
            module: "USERS",
            action: "USER_CREATED",
            entityType: "User",
            entityId: user.id,
            severity: client_1.AuditSeverity.CRITICAL,
            summary: `Usuario creado: ${user.name} (${user.role})`,
            metadata: { email: user.email, role: user.role },
        });
        return user;
    }
    async update(id, dto) {
        const current = await this.prisma.user.findUnique({ where: { id } });
        if (!current) {
            throw new common_1.NotFoundException("User not found");
        }
        if (current.role === client_1.UserRole.OWNER && dto.role && dto.role !== client_1.UserRole.OWNER) {
            const owners = await this.prisma.user.count({ where: { role: client_1.UserRole.OWNER } });
            if (owners <= 1) {
                throw new common_1.BadRequestException("No se puede quitar el ultimo OWNER del sistema");
            }
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name?.trim(),
                email: dto.email?.trim().toLowerCase(),
                passwordHash: dto.password ? await (0, bcryptjs_1.hash)(dto.password, 12) : undefined,
                role: dto.role,
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });
        await this.audit.record({
            module: "USERS",
            action: "USER_UPDATED",
            entityType: "User",
            entityId: user.id,
            severity: client_1.AuditSeverity.CRITICAL,
            summary: `Usuario actualizado: ${user.name} (${user.role})`,
            metadata: { email: user.email, previousRole: current.role, role: user.role, passwordChanged: Boolean(dto.password) },
        });
        return user;
    }
    async remove(id) {
        const current = await this.prisma.user.findUnique({ where: { id } });
        if (!current) {
            throw new common_1.NotFoundException("User not found");
        }
        if (current.role === client_1.UserRole.OWNER) {
            const owners = await this.prisma.user.count({ where: { role: client_1.UserRole.OWNER } });
            if (owners <= 1) {
                throw new common_1.BadRequestException("No se puede eliminar el ultimo OWNER del sistema");
            }
        }
        const user = await this.prisma.user.delete({
            where: { id },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });
        await this.audit.record({
            module: "USERS",
            action: "USER_DELETED",
            entityType: "User",
            entityId: user.id,
            severity: client_1.AuditSeverity.CRITICAL,
            summary: `Usuario eliminado: ${user.name} (${user.role})`,
            metadata: { email: user.email, role: user.role },
        });
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map