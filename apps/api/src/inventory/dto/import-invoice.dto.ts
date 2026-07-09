import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ImportInvoiceDto {
  @IsString()
  dataUrl!: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsBoolean()
  createStockEntries?: boolean;
}
