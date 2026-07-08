import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePaymentDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  quoteId?: string;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @IsOptional()
  @IsString()
  inventoryItemName?: string;

  @IsOptional()
  @IsString()
  inventorySku?: string;

  @IsOptional()
  @IsString()
  inventorySourceType?: string;

  @IsOptional()
  @IsString()
  inventoryUnit?: string;

  @IsOptional()
  @IsBoolean()
  createInventoryEntry?: boolean;

  @IsOptional()
  @IsIn(["INCOME", "EXPENSE"])
  transactionType?: "INCOME" | "EXPENSE";

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  concept!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
