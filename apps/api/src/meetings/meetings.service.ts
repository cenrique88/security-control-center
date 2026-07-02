import { Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MeetingStatus, MeetingType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
import { CreateMeetingDto, MeetingAttachmentDto } from "./dto/create-meeting.dto";
import { UpdateMeetingDto } from "./dto/update-meeting.dto";

type MeetingFilters = {
  search?: string;
  customerId?: string;
  type?: MeetingType;
  status?: MeetingStatus;
};

@Injectable()
export class MeetingsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MeetingsService.name);
  private reminderTimer?: NodeJS.Timeout;
  private reminderRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsAppService: WhatsAppService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.reminderTimer = setInterval(() => void this.sendDueWhatsAppReminders(), 60_000);
    void this.sendDueWhatsAppReminders();
  }

  onModuleDestroy() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
    }
  }

  async list(filters: MeetingFilters) {
    const where: Prisma.MeetingWhereInput = {};

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { objective: { contains: query, mode: "insensitive" } },
        { contact: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        { commitments: { contains: query, mode: "insensitive" } },
        { nextStep: { contains: query, mode: "insensitive" } },
        { customer: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    return this.prisma.meeting.findMany({
      where,
      orderBy: [{ dateTime: "desc" }, { updatedAt: "desc" }],
      include: this.includeRelations(),
    });
  }

  async create(dto: CreateMeetingDto) {
    await this.ensureCustomer(dto.customerId);

    return this.prisma.meeting.create({
      data: {
        customerId: dto.customerId,
        dateTime: new Date(dto.dateTime),
        contact: this.cleanOptional(dto.contact),
        type: dto.type as MeetingType,
        status: (dto.status as MeetingStatus | undefined) ?? "PENDING",
        objective: dto.objective.trim(),
        notes: this.cleanOptional(dto.notes),
        commitments: this.cleanOptional(dto.commitments),
        nextStep: this.cleanOptional(dto.nextStep),
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        attendees: this.cleanOptional(dto.attendees),
        needs: this.cleanOptional(dto.needs),
        equipmentNeeded: this.cleanOptional(dto.equipmentNeeded),
        estimatedBudget: dto.estimatedBudget,
        closeProbability: dto.closeProbability,
        reminderEnabled: dto.reminderEnabled ?? true,
        reminderMinutesBefore: dto.reminderMinutesBefore ?? 30,
        attachments: dto.attachments?.length
          ? {
              create: dto.attachments.map((attachment) => this.toAttachmentCreateData(attachment)),
            }
          : undefined,
      },
      include: this.includeRelations(),
    });
  }

  async update(id: string, dto: UpdateMeetingDto) {
    const current = await this.prisma.meeting.findUnique({ where: { id }, select: { id: true } });
    if (!current) {
      throw new NotFoundException("Meeting not found");
    }

    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    return this.prisma.meeting.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        dateTime: dto.dateTime ? new Date(dto.dateTime) : undefined,
        contact: this.cleanNullable(dto.contact),
        type: dto.type as MeetingType | undefined,
        status: dto.status as MeetingStatus | undefined,
        objective: this.cleanOptional(dto.objective),
        notes: this.cleanNullable(dto.notes),
        commitments: this.cleanNullable(dto.commitments),
        nextStep: this.cleanNullable(dto.nextStep),
        followUpDate: dto.followUpDate === "" ? null : dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        attendees: this.cleanNullable(dto.attendees),
        needs: this.cleanNullable(dto.needs),
        equipmentNeeded: this.cleanNullable(dto.equipmentNeeded),
        estimatedBudget: dto.estimatedBudget,
        closeProbability: dto.closeProbability,
        reminderEnabled: dto.reminderEnabled,
        reminderMinutesBefore: dto.reminderMinutesBefore,
        reminderSentAt: dto.dateTime || dto.status === "PENDING" ? null : undefined,
        attachments: dto.attachments?.length
          ? {
              create: dto.attachments.map((attachment) => this.toAttachmentCreateData(attachment)),
            }
          : undefined,
      },
      include: this.includeRelations(),
    });
  }

  private includeRelations() {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          reference: true,
          email: true,
          phone: true,
        },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    } satisfies Prisma.MeetingInclude;
  }

  private async sendDueWhatsAppReminders() {
    if (this.reminderRunning) {
      return;
    }

    const to = this.config.get<string>("MEETING_REMINDER_WHATSAPP_TO") ?? this.config.get<string>("OPERATOR_WHATSAPP_NUMBER");
    if (!to?.trim()) {
      return;
    }

    this.reminderRunning = true;
    try {
      const now = new Date();
      const maxWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const meetings = await this.prisma.meeting.findMany({
        where: {
          status: "PENDING",
          reminderEnabled: true,
          reminderSentAt: null,
          dateTime: {
            gt: now,
            lte: maxWindow,
          },
        },
        include: this.includeRelations(),
        orderBy: { dateTime: "asc" },
        take: 25,
      });

      for (const meeting of meetings) {
        const reminderAt = new Date(meeting.dateTime.getTime() - meeting.reminderMinutesBefore * 60_000);
        if (reminderAt > now) {
          continue;
        }

        try {
          await this.whatsAppService.send({
            to,
            message: this.buildReminderMessage(meeting),
          });
          await this.prisma.meeting.update({
            where: { id: meeting.id },
            data: { reminderSentAt: new Date() },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`No se pudo enviar recordatorio de reunion ${meeting.id}: ${message}`);
        }
      }
    } finally {
      this.reminderRunning = false;
    }
  }

  private buildReminderMessage(meeting: Awaited<ReturnType<MeetingsService["list"]>>[number]) {
    const lines = [
      "Recordatorio de reunion - Security Solutions",
      "",
      `En ${meeting.reminderMinutesBefore} min: ${this.formatMeetingDate(meeting.dateTime)}`,
      `Cliente: ${meeting.customer.name}`,
      meeting.contact ? `Contacto: ${meeting.contact}` : "",
      `Tipo: ${this.meetingTypeLabel(meeting.type)}`,
      `Objetivo: ${meeting.objective}`,
      meeting.nextStep ? `Proximo paso: ${meeting.nextStep}` : "",
      meeting.needs ? `Necesidades: ${meeting.needs}` : "",
      meeting.equipmentNeeded ? `Equipos: ${meeting.equipmentNeeded}` : "",
    ];

    return lines.filter(Boolean).join("\n");
  }

  private formatMeetingDate(value: Date) {
    return new Intl.DateTimeFormat("es-UY", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Montevideo",
    }).format(value);
  }

  private meetingTypeLabel(type: MeetingType) {
    return type === "VIDEO_CALL" ? "Videollamada" : type === "PHONE" ? "Telefono" : "Presencial";
  }

  private toAttachmentCreateData(attachment: MeetingAttachmentDto) {
    return {
      name: attachment.name.trim(),
      mimeType: this.cleanOptional(attachment.mimeType),
      size: attachment.size,
      dataUrl: attachment.dataUrl,
    };
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }

  private cleanNullable(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const clean = value.trim();
    return clean ? clean : null;
  }
}
