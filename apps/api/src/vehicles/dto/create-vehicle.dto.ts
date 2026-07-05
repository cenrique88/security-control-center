import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateVehicleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  plate?: string;

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
}
