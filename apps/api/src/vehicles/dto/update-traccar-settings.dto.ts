import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateTraccarSettingsDto {
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  @Min(20)
  matchRadiusMeters?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minStopMinutes?: number;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsNumber()
  companyLatitude?: number;

  @IsOptional()
  @IsNumber()
  companyLongitude?: number;
}
