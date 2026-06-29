import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePaymentDto {
  @IsString()
  customerId!: string;

  @IsString()
  concept!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
