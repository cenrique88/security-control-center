import { IsOptional, IsString, MinLength } from "class-validator";

export class SendWhatsAppMessageDto {
  @IsString()
  @MinLength(5)
  to!: string;

  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}
