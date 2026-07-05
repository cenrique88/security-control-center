import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSiteDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;
}
