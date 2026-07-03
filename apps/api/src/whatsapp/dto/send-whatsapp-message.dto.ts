import { IsObject, IsOptional, IsString, MinLength } from "class-validator";

class MessageAttachmentDto {
  @IsString()
  name!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  dataUrl!: string;
}

export class SendWhatsAppMessageDto {
  @IsString()
  @MinLength(5)
  to!: string;

  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsObject()
  attachment?: MessageAttachmentDto;

  @IsOptional()
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}
