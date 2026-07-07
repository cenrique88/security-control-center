import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

enum CustomerStatusDto {
  ACTIVE = "ACTIVE",
  PROSPECT = "PROSPECT",
  INACTIVE = "INACTIVE",
}

enum CustomerTypeDto {
  NORMAL = "NORMAL",
  THIRD_PARTY = "THIRD_PARTY",
  IMPORTER = "IMPORTER",
  INTERNAL = "INTERNAL",
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsEnum(CustomerTypeDto)
  type?: CustomerTypeDto;

  @IsOptional()
  @IsEnum(CustomerStatusDto)
  status?: CustomerStatusDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
