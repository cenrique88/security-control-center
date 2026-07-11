import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  colorHex?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  traccarDeviceId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelKmPerLiter?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  monitoringPhones?: string;

  @IsOptional()
  @IsString()
  clientShareUrl?: string;

  @IsOptional()
  @IsBoolean()
  gpsMonitoringEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  gpsWhatsappAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  gpsEngineCommandsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  gpsAutoEngineStopOnAlarm?: boolean;

  @IsOptional()
  @IsBoolean()
  gpsCommandTextChannel?: boolean;

  @IsOptional()
  @IsString()
  gpsStatusCommand?: string;

  @IsOptional()
  @IsString()
  gpsEngineStopCommand?: string;

  @IsOptional()
  @IsString()
  gpsEngineResumeCommand?: string;
}
