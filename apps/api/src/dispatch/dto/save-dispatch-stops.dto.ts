import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export enum DispatchPlaceTypeDto {
  CLIENT = "CLIENT",
  FUTURE_CLIENT = "FUTURE_CLIENT",
  IMPORTER = "IMPORTER",
  WAREHOUSE = "WAREHOUSE",
  LUNCH = "LUNCH",
  TRANSFER = "TRANSFER",
  OTHER = "OTHER",
}

export class SaveDispatchStopDto {
  @IsString()
  stopKey!: string;

  @IsOptional()
  @IsEnum(DispatchPlaceTypeDto)
  placeType?: DispatchPlaceTypeDto;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  siteId?: string;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  futureClientName?: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  parkingCost?: number;

  @IsOptional()
  @IsNumber()
  tollCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class SaveDispatchStopsDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveDispatchStopDto)
  stops!: SaveDispatchStopDto[];
}
