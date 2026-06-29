import { IsBoolean, IsOptional, IsString } from "class-validator";

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
  @IsBoolean()
  active?: boolean;
}
