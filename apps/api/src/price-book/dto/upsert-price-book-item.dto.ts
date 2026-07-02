import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

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

enum QuoteItemTypeDto {
  EQUIPMENT = "EQUIPMENT",
  MATERIAL = "MATERIAL",
  SUPPLY = "SUPPLY",
  LABOR = "LABOR",
  EXPENSE = "EXPENSE",
}

export class UpsertPriceBookItemDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(QuoteItemTypeDto)
  type?: QuoteItemTypeDto;

  @IsString()
  category!: string;

  @IsOptional()
  @IsEnum(ServiceTypeDto)
  service?: ServiceTypeDto;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
