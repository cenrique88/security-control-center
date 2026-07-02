import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateLaborPointRateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNumber()
  @Min(0)
  pointValue!: number;

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
