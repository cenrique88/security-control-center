"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MeetingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let MeetingsService = MeetingsService_1 = class MeetingsService {
    prisma;
    whatsAppService;
    config;
    logger = new common_1.Logger(MeetingsService_1.name);
    reminderTimer;
    reminderRunning = false;
    constructor(prisma, whatsAppService, config) {
        this.prisma = prisma;
        this.whatsAppService = whatsAppService;
        this.config = config;
    }
    onModuleInit() {
        this.reminderTimer = setInterval(() => void this.sendDueWhatsAppReminders(), 60_000);
        void this.sendDueWhatsAppReminders();
    }
    onModuleDestroy() {
        if (this.reminderTimer) {
            clearInterval(this.reminderTimer);
        }
    }
    async list(filters) {
        const where = {};
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
    async create(dto) {
        await this.ensureCustomer(dto.customerId);
        return this.prisma.meeting.create({
            data: {
                customerId: dto.customerId,
                dateTime: new Date(dto.dateTime),
                contact: this.cleanOptional(dto.contact),
                type: dto.type,
                status: dto.status ?? "PENDING",
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
    async update(id, dto) {
        const current = await this.prisma.meeting.findUnique({ where: { id }, select: { id: true } });
        if (!current) {
            throw new common_1.NotFoundException("Meeting not found");
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
                type: dto.type,
                status: dto.status,
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
    includeRelations() {
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
        };
    }
    async sendDueWhatsAppReminders() {
        if (this.reminderRunning) {
            return;
        }
        const to = this.config.get("MEETING_REMINDER_WHATSAPP_TO") ?? this.config.get("OPERATOR_WHATSAPP_NUMBER");
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
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.logger.warn(`No se pudo enviar recordatorio de reunion ${meeting.id}: ${message}`);
                }
            }
        }
        finally {
            this.reminderRunning = false;
        }
    }
    buildReminderMessage(meeting) {
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
    formatMeetingDate(value) {
        return new Intl.DateTimeFormat("es-UY", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "America/Montevideo",
        }).format(value);
    }
    meetingTypeLabel(type) {
        return type === "VIDEO_CALL" ? "Videollamada" : type === "PHONE" ? "Telefono" : "Presencial";
    }
    toAttachmentCreateData(attachment) {
        return {
            name: attachment.name.trim(),
            mimeType: this.cleanOptional(attachment.mimeType),
            size: attachment.size,
            dataUrl: attachment.dataUrl,
        };
    }
    async ensureCustomer(id) {
        const customer = await this.prisma.customer.findUnique({ where: { id }, select: { id: true } });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
    }
    cleanOptional(value) {
        const clean = value?.trim();
        return clean ? clean : undefined;
    }
    cleanNullable(value) {
        if (value === undefined) {
            return undefined;
        }
        const clean = value.trim();
        return clean ? clean : null;
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = MeetingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService,
        config_1.ConfigService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map