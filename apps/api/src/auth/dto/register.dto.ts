import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

enum RegisterRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  TECHNICIAN = "TECHNICIAN",
  SALES = "SALES",
  MONITORING = "MONITORING",
}

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(RegisterRole)
  role?: RegisterRole;
}
