import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

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
  @IsString()
  workOrderId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}
