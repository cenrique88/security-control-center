import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

enum ServiceTypeDto {
  CCTV = "CCTV",
  ALARM = "ALARM",
  ACCESS_CONTROL = "ACCESS_CONTROL",
  GPS = "GPS",
  NETWORKING = "NETWORKING",
  MAINTENANCE = "MAINTENANCE",
  OTHER = "OTHER",
}

enum WorkOrderStatusDto {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  WAITING_CUSTOMER = "WAITING_CUSTOMER",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export class CreateWorkOrderDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  siteId?: string;

  @IsString()
  title!: string;

  @IsEnum(ServiceTypeDto)
  type!: ServiceTypeDto;

  @IsOptional()
  @IsEnum(WorkOrderStatusDto)
  status?: WorkOrderStatusDto;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
