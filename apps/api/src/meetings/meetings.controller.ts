import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { MeetingStatus, MeetingType } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { UpdateMeetingDto } from "./dto/update-meeting.dto";
import { MeetingsService } from "./meetings.service";

@Controller("meetings")
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("customerId") customerId?: string,
    @Query("type") type?: MeetingType,
    @Query("status") status?: MeetingStatus,
  ) {
    return this.meetingsService.list({ search, customerId, type, status });
  }

  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, dto);
  }
}
