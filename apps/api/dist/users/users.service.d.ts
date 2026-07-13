import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
    }>;
}
