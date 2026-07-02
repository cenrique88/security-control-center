import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpsertCustomerPriceOverrideDto {
  @IsString()
  customerId!: string;

  @IsString()
  priceBookItemId!: string;

  @IsNumber()
  @Min(0)
  salePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

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

  @IsOptional()
  @IsString()
  notes?: string;
}
