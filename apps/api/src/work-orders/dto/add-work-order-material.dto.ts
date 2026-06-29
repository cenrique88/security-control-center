import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddWorkOrderMaterialDto {
  @IsString()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsBoolean()
  installAsDevice?: boolean;
}
