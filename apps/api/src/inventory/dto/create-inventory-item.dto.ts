import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

enum ServiceTypeDto {
  CCTV = "CCTV",
  ALARM = "ALARM",
  ACCESS_CONTROL = "ACCESS_CONTROL",
  GPS = "GPS",
  NETWORKING = "NETWORKING",
  MAINTENANCE = "MAINTENANCE",
  OTHER = "OTHER",
}

export class CreateInventoryItemDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(ServiceTypeDto)
  category?: ServiceTypeDto;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
