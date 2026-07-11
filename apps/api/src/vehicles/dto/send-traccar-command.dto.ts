import { IsIn, IsOptional, IsString } from "class-validator";

export class SendTraccarCommandDto {
  @IsIn(["status", "engineStop", "engineResume"])
  command!: "status" | "engineStop" | "engineResume";

  @IsOptional()
  @IsString()
  confirmation?: string;
}
