import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  concept?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
