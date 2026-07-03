import { IsEmail, IsObject, IsOptional, IsString, MinLength } from "class-validator";

class MessageAttachmentDto {
  @IsString()
  name!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  dataUrl!: string;
}

export class SendGmailMessageDto {
  @IsEmail()
  to!: string;

  @IsString()
  @MinLength(1)
  subject!: string;

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
