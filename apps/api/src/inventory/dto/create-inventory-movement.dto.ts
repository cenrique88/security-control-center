import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

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
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  installedDeviceId?: string;
}
