import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCustomerDocumentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8 * 1024 * 1024)
  size?: number;

  @IsString()
  dataUrl!: string;
}
