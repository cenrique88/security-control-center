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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    config;
    prisma;
    logger = new common_1.Logger(WhatsAppService_1.name);
    dailySummaryTimer;
    dailySummaryRunning = false;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    onModuleInit() {
        this.dailySummaryTimer = setInterval(() => void this.sendDailyMeetingSummaryIfDue(), 60_000);
        void this.sendDailyMeetingSummaryIfDue();
    }
    onModuleDestroy() {
        if (this.dailySummaryTimer) {
            clearInterval(this.dailySummaryTimer);
        }
    }
    async status() {
        const checks = [
            {
                key: "OPENWA_API_URL",
                label: "OpenWA API URL",
                configured: Boolean(this.config.get("OPENWA_API_URL")),
            },
            {
                key: "OPENWA_SESSION",
                label: "Sesion",
                configured: Boolean(this.config.get("OPENWA_SESSION")),
            },
            {
                key: "OPENWA_API_KEY",
                label: "API key",
                configured: Boolean(this.config.get("OPENWA_API_KEY")),
            },
            {
                key: "OPENWA_WEBHOOK_SECRET",
                label: "Webhook secret",
                configured: Boolean(this.config.get("OPENWA_WEBHOOK_SECRET")),
            },
        ];
        const configured = checks.slice(0, 3).every((check) => check.configured);
        let reachable = false;
        let connectionError = "";
        if (configured) {
            const apiUrl = this.config.get("OPENWA_API_URL")?.replace(/\/+$/, "");
            const apiKey = this.config.get("OPENWA_API_KEY");
            if (apiUrl && apiKey) {
                try {
                    await this.openWaRequest(apiUrl, apiKey, "/sessions");
                    reachable = true;
                }
                catch (error) {
                    connectionError = error instanceof Error ? error.message : String(error);
                }
            }
        }
        return {
            provider: "OpenWA",
            connected: configured && reachable,
            lastSyncAt: null,
            unread: 0,
            pendingReplies: 0,
            activeChats: 0,
            checks,
            connectionError,
        };
    }
    async sync() {
        const apiUrl = this.config.get("OPENWA_API_URL")?.replace(/\/+$/, "");
        const apiKey = this.config.get("OPENWA_API_KEY");
        const sessionName = this.config.get("OPENWA_SESSION");
        if (!apiUrl || !apiKey || !sessionName) {
            throw new common_1.BadRequestException("OpenWA is not configured");
        }
        const sessions = await this.openWaRequest(apiUrl, apiKey, "/sessions");
        const stats = await this.safeOpenWaRequest(apiUrl, apiKey, "/sessions/stats/overview", {});
        const session = sessions.find((item) => item.name === sessionName || item.id === sessionName) ??
            sessions.find((item) => item.status === "ready") ??
            sessions[0];
        if (!session) {
            throw new common_1.ServiceUnavailableException("No OpenWA session found");
        }
        const [chats, groups] = await Promise.all([
            this.safeOpenWaRequest(apiUrl, apiKey, `/sessions/${session.id}/chats`, []),
            this.safeOpenWaRequest(apiUrl, apiKey, `/sessions/${session.id}/groups`, []),
        ]);
        const sortedChats = [...chats].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
        const unread = sortedChats.reduce((total, chat) => total + (chat.unreadCount ?? 0), 0);
        return {
            provider: "OpenWA",
            connected: session.status === "ready",
            lastSyncAt: new Date().toISOString(),
            unread,
            pendingReplies: sortedChats.filter((chat) => (chat.unreadCount ?? 0) > 0).length,
            activeChats: sortedChats.length,
            session,
            stats,
            chats: sortedChats.slice(0, 60),
            groups: groups.slice(0, 60),
        };
    }
    async send(dto) {
        const apiUrl = this.config.get("OPENWA_API_URL")?.replace(/\/+$/, "");
        const apiKey = this.config.get("OPENWA_API_KEY");
        const sessionName = this.config.get("OPENWA_SESSION");
        if (!apiUrl || !apiKey || !sessionName) {
            throw new common_1.BadRequestException("OpenWA is not configured");
        }
        const sessions = await this.openWaRequest(apiUrl, apiKey, "/sessions");
        const session = sessions.find((item) => item.name === sessionName || item.id === sessionName) ??
            sessions.find((item) => item.status === "ready") ??
            sessions[0];
        if (!session) {
            throw new common_1.ServiceUnavailableException("No OpenWA session found");
        }
        const to = dto.to.includes("@") ? dto.to.trim() : this.normalizePhone(dto.to);
        if (!to) {
            throw new common_1.BadRequestException("WhatsApp destination phone is required");
        }
        const chatId = to.includes("@") ? to : `${to}@c.us`;
        const forcedPath = this.config.get("OPENWA_SEND_PATH");
        const result = await this.openWaSend(apiUrl, apiKey, [
            ...(forcedPath
                ? [
                    {
                        path: forcedPath,
                        body: { to, chatId, phone: to, message: dto.message, text: dto.message, content: dto.message },
                    },
                ]
                : []),
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { to, message: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { to: chatId, message: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { phone: to, message: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { recipient: chatId, message: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { chatId, text: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { chatId, message: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send-text`,
                body: { chatId, content: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send`,
                body: { chatId, text: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages/send`,
                body: { to, message: dto.message },
            },
            {
                path: "/sendText",
                body: { session: session.name ?? session.id, chatId, text: dto.message },
            },
            {
                path: "/sendText",
                body: { session: session.name ?? session.id, to, message: dto.message },
            },
            {
                path: "/sendText",
                body: { sessionId: session.id, chatId, text: dto.message },
            },
            {
                path: `/${session.name ?? session.id}/send-message`,
                body: { phone: to, message: dto.message, isGroup: chatId.endsWith("@g.us") },
            },
            {
                path: `/${session.id}/send-message`,
                body: { phone: to, message: dto.message, isGroup: chatId.endsWith("@g.us") },
            },
            {
                path: `/sessions/${session.id}/send-message`,
                body: { to, chatId, phone: to, message: dto.message, text: dto.message },
            },
            {
                path: `/sessions/${session.id}/send-text`,
                body: { to, chatId, phone: to, message: dto.message, text: dto.message },
            },
            {
                path: `/sessions/${session.id}/messages`,
                body: { to, chatId, phone: to, message: dto.message, text: dto.message },
            },
            {
                path: "/messages/send",
                body: { sessionId: session.id, session: session.name ?? session.id, to, chatId, message: dto.message, text: dto.message },
            },
        ]);
        return {
            provider: "OpenWA",
            sent: true,
            to,
            sentAt: new Date().toISOString(),
            result,
        };
    }
    async getDailyMeetingSummary() {
        const settings = await this.getOrCreateDailySummarySettings();
        const preview = await this.buildDailyMeetingSummaryPreview();
        return { settings, preview };
    }
    async updateDailyMeetingSummary(dto) {
        const current = await this.getOrCreateDailySummarySettings();
        const settings = await this.prisma.whatsAppDailySummarySettings.update({
            where: { id: current.id },
            data: {
                enabled: dto.enabled,
                recipientName: this.cleanNullable(dto.recipientName),
                recipientPhone: dto.recipientPhone?.trim(),
                sendTime: dto.sendTime,
                messageTemplate: dto.messageTemplate,
            },
        });
        const preview = await this.buildDailyMeetingSummaryPreview(settings.messageTemplate);
        return { settings, preview };
    }
    async sendDailyMeetingSummaryNow() {
        const settings = await this.getOrCreateDailySummarySettings();
        const preview = await this.buildDailyMeetingSummaryPreview(settings.messageTemplate);
        await this.send({ to: settings.recipientPhone, message: preview.message });
        const updated = await this.prisma.whatsAppDailySummarySettings.update({
            where: { id: settings.id },
            data: {
                lastSentForDate: preview.dateKey,
                lastSentAt: new Date(),
            },
        });
        return { settings: updated, preview, sent: true };
    }
    async sendDailyMeetingSummaryIfDue() {
        if (this.dailySummaryRunning) {
            return;
        }
        this.dailySummaryRunning = true;
        try {
            const settings = await this.getOrCreateDailySummarySettings();
            if (!settings.enabled || !settings.recipientPhone.trim()) {
                return;
            }
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            const preview = await this.buildDailyMeetingSummaryPreview(settings.messageTemplate);
            if (currentTime < settings.sendTime || settings.lastSentForDate === preview.dateKey) {
                return;
            }
            await this.send({ to: settings.recipientPhone, message: preview.message });
            await this.prisma.whatsAppDailySummarySettings.update({
                where: { id: settings.id },
                data: {
                    lastSentForDate: preview.dateKey,
                    lastSentAt: now,
                },
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`No se pudo enviar resumen diario de reuniones: ${message}`);
        }
        finally {
            this.dailySummaryRunning = false;
        }
    }
    async getOrCreateDailySummarySettings() {
        return this.prisma.whatsAppDailySummarySettings.upsert({
            where: { id: "meeting-summary" },
            create: {
                id: "meeting-summary",
                enabled: true,
                recipientName: "Lewis",
                recipientPhone: "097684200",
                sendTime: "18:00",
            },
            update: {},
        });
    }
    async buildDailyMeetingSummaryPreview(template) {
        const target = this.tomorrowRange();
        const meetings = await this.prisma.meeting.findMany({
            where: {
                status: "PENDING",
                dateTime: {
                    gte: target.start,
                    lt: target.end,
                },
            },
            include: {
                customer: {
                    select: {
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
            orderBy: { dateTime: "asc" },
        });
        const settings = template ? null : await this.getOrCreateDailySummarySettings();
        const messageTemplate = template ?? settings?.messageTemplate ?? "Resumen de reuniones para {fecha}\n\n{reuniones}\n\nSecurity Solutions";
        const meetingsText = meetings.length
            ? meetings.map((meeting, index) => this.formatMeetingSummaryLine(meeting, index + 1)).join("\n\n")
            : "No hay reuniones coordinadas para esa fecha.";
        const dateLabel = new Intl.DateTimeFormat("es-UY", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "America/Montevideo",
        }).format(target.start);
        return {
            dateKey: target.dateKey,
            dateLabel,
            meetingsCount: meetings.length,
            meetings,
            message: messageTemplate
                .replaceAll("{fecha}", dateLabel)
                .replaceAll("{cantidad}", String(meetings.length))
                .replaceAll("{reuniones}", meetingsText),
        };
    }
    tomorrowRange() {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
        return { start, end, dateKey };
    }
    formatMeetingSummaryLine(meeting, index) {
        const time = new Intl.DateTimeFormat("es-UY", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Montevideo",
        }).format(meeting.dateTime);
        const details = [
            `${index}. ${time} - ${meeting.customer.name}`,
            meeting.contact ? `Contacto: ${meeting.contact}` : "",
            `Tipo: ${this.meetingTypeLabel(meeting.type)}`,
            `Objetivo: ${meeting.objective}`,
            meeting.nextStep ? `Proximo paso: ${meeting.nextStep}` : "",
            meeting.needs ? `Necesidades: ${meeting.needs}` : "",
        ];
        return details.filter(Boolean).join("\n");
    }
    meetingTypeLabel(type) {
        return type === "VIDEO_CALL" ? "Videollamada" : type === "PHONE" ? "Telefono" : "Presencial";
    }
    async openWaRequest(apiUrl, apiKey, path, options = {}) {
        let response;
        try {
            response = await fetch(`${apiUrl}/api${path}`, {
                method: options.method ?? "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
            });
        }
        catch {
            throw new common_1.ServiceUnavailableException(`No se pudo conectar con OpenWA en ${apiUrl}`);
        }
        if (!response.ok) {
            throw new common_1.ServiceUnavailableException(`OpenWA request failed: ${response.status}`);
        }
        return response.json();
    }
    async safeOpenWaRequest(apiUrl, apiKey, path, fallback, options = {}) {
        try {
            return await this.openWaRequest(apiUrl, apiKey, path, options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`OpenWA endpoint opcional omitido ${path}: ${message}`);
            return fallback;
        }
    }
    async openWaSend(apiUrl, apiKey, candidates) {
        const failures = [];
        for (const candidate of candidates) {
            let response;
            try {
                response = await fetch(`${apiUrl}/api${candidate.path}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    },
                    body: JSON.stringify(candidate.body),
                });
            }
            catch {
                failures.push(`${candidate.path}: sin conexion`);
                continue;
            }
            if (response.ok) {
                return (await this.safeJson(response));
            }
            failures.push(`${candidate.path}: ${response.status}${await this.responseFailureDetail(response)}`);
        }
        throw new common_1.ServiceUnavailableException(`OpenWA send failed (${failures.join(", ")})`);
    }
    async responseFailureDetail(response) {
        try {
            const text = await response.text();
            return text ? ` ${text.slice(0, 180)}` : "";
        }
        catch {
            return "";
        }
    }
    async safeJson(response) {
        const text = await response.text();
        if (!text) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch {
            return { response: text };
        }
    }
    normalizePhone(value) {
        const digits = value.replace(/\D/g, "");
        if (!digits) {
            return "";
        }
        if (digits.startsWith("598")) {
            return digits;
        }
        if (digits.startsWith("0")) {
            return `598${digits.slice(1)}`;
        }
        return digits.length <= 9 ? `598${digits}` : digits;
    }
    cleanNullable(value) {
        if (value === undefined) {
            return undefined;
        }
        const clean = value.trim();
        return clean ? clean : null;
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map