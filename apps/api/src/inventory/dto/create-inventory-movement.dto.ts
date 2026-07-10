import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

enum InventoryMovementTypeDto {
  IN = "IN",
  OUT = "OUT",
  ADJUST = "ADJUST",
}

export class CreateInventoryMovementDto {
  @IsString()
  itemId!: string;

  @IsEnum(InventoryMovementTypeDto)
  type!: InventoryMovementTypeDto;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  createExpense?: boolean;

  @IsOptional()
  @IsBoolean()
  zeroCostRecovery?: boolean;

  @IsOptional()
  @IsString()
  paymentCategory?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  installedDeviceId?: string;
}

export class CreateInventoryMovementBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryMovementDto)
  items!: CreateInventoryMovementDto[];

  @IsEnum(InventoryMovementTypeDto)
  type!: InventoryMovementTypeDto;

  @IsOptional()
  @IsBoolean()
  createExpense?: boolean;

  @IsOptional()
  @IsBoolean()
  zeroCostRecovery?: boolean;

  @IsOptional()
  @IsString()
  paymentCategory?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  installedDeviceId?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
