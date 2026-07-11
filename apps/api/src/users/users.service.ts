import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditSeverity, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        passwordHash: await hash(dto.password, 12),
        role: dto.role ?? UserRole.TECHNICIAN,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    await this.audit.record({
      module: "USERS",
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      severity: AuditSeverity.CRITICAL,
      summary: `Usuario creado: ${user.name} (${user.role})`,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException("User not found");
    }

    if (current.role === UserRole.OWNER && dto.role && dto.role !== UserRole.OWNER) {
      const owners = await this.prisma.user.count({ where: { role: UserRole.OWNER } });
      if (owners <= 1) {
        throw new BadRequestException("No se puede quitar el ultimo OWNER del sistema");
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        email: dto.email?.trim().toLowerCase(),
        passwordHash: dto.password ? await hash(dto.password, 12) : undefined,
        role: dto.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    await this.audit.record({
      module: "USERS",
      action: "USER_UPDATED",
      entityType: "User",
      entityId: user.id,
      severity: AuditSeverity.CRITICAL,
      summary: `Usuario actualizado: ${user.name} (${user.role})`,
      metadata: { email: user.email, previousRole: current.role, role: user.role, passwordChanged: Boolean(dto.password) },
    });

    return user;
  }

  async remove(id: string) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException("User not found");
    }

    if (current.role === UserRole.OWNER) {
      const owners = await this.prisma.user.count({ where: { role: UserRole.OWNER } });
      if (owners <= 1) {
        throw new BadRequestException("No se puede eliminar el ultimo OWNER del sistema");
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
      severity: AuditSeverity.CRITICAL,
      summary: `Usuario eliminado: ${user.name} (${user.role})`,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }
}
