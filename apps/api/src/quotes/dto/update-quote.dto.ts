import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
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
  @IsDateString()
  acceptedAt?: string;
}
