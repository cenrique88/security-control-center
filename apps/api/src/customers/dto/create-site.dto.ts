import { IsOptional, IsString } from "class-validator";

export class CreateSiteDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
