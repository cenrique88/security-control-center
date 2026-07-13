import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
