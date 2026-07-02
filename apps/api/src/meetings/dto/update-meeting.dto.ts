import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { MeetingAttachmentDto } from "./create-meeting.dto";

export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsIn(["IN_PERSON", "VIDEO_CALL", "PHONE"])
  type?: "IN_PERSON" | "VIDEO_CALL" | "PHONE";

  @IsOptional()
  @IsIn(["PENDING", "DONE", "CANCELLED"])
  status?: "PENDING" | "DONE" | "CANCELLED";

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  commitments?: string;

  @IsOptional()
  @IsString()
  nextStep?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  attendees?: string;

  @IsOptional()
  @IsString()
  needs?: string;

  @IsOptional()
  @IsString()
  equipmentNeeded?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  closeProbability?: number;

  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  reminderMinutesBefore?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingAttachmentDto)
  attachments?: MeetingAttachmentDto[];
}
