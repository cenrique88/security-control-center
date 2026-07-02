import { IsBoolean, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateDailySummaryDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  sendTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  messageTemplate?: string;
}
