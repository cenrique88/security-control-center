import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

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

enum QuoteStatusDto {
  DRAFT = "DRAFT",
  SENT = "SENT",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

enum QuoteItemTypeDto {
  EQUIPMENT = "EQUIPMENT",
  MATERIAL = "MATERIAL",
  SUPPLY = "SUPPLY",
  LABOR = "LABOR",
  EXPENSE = "EXPENSE",
}

export class CreateQuoteItemDto {
  @IsOptional()
  @IsString()
  priceBookItemId?: string;

  @IsEnum(QuoteItemTypeDto)
  type!: QuoteItemTypeDto;

  @IsString()
  category!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;
}

export class CreateQuoteDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  meetingId?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsEnum(ServiceTypeDto)
  service?: ServiceTypeDto;

  @IsOptional()
  @IsEnum(QuoteStatusDto)
  status?: QuoteStatusDto;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsBoolean()
  taxIncluded?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  profitMarginPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  laborPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  commercialTerms?: string;

  @IsOptional()
  @IsString()
  executionTime?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items?: CreateQuoteItemDto[];
}
