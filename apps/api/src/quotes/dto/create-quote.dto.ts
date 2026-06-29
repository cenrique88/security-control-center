import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateQuoteDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  laborPoints?: number;

  @IsNumber()
  @Min(0)
  subtotal!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}
