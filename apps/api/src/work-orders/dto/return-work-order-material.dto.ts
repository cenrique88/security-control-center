import { IsInt, IsString, Min } from "class-validator";

export class ReturnWorkOrderMaterialDto {
  @IsString()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
