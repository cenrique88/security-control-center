import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

enum ServiceTypeDto {
  CCTV = "CCTV",
  ALARM = "ALARM",
  ACCESS_CONTROL = "ACCESS_CONTROL",
  CABLING = "CABLING",
  GPS = "GPS",
  ELECTRIC_FENCE = "ELECTRIC_FENCE",
  AUTOMATION = "AUTOMATION",
  NETWORKING = "NETWORKING",
  MAINTENANCE = "MAINTENANCE",
  OTHER = "OTHER",
}

export class CreateDeviceDto {
  @IsString()
  siteId!: string;

  @IsEnum(ServiceTypeDto)
  type!: ServiceTypeDto;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsDateString()
  installedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
