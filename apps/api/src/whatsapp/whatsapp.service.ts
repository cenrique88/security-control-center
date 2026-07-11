import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Meeting, MeetingType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";
import { UpdateDailySummaryDto } from "./dto/update-daily-summary.dto";

type OpenWaSession = {
  id: string;
  name: string;
  status?: string;
  phone?: string;
  pushName?: string;
  connectedAt?: string | null;
  lastActive?: string | null;
};

type OpenWaChat = {
  id: string;
  name?: string;
  isGroup?: boolean;
  unreadCount?: number;
  timestamp?: number;
  lastMessage?: string;
  labels?: Array<string | { name?: string; label?: string; title?: string }>;
  label?: string;
  category?: string;
  type?: string;
};

type OpenWaGroup = {
  id: string;
  name?: string;
  labels?: Array<string | { name?: string; label?: string; title?: string }>;
  label?: string;
  category?: string;
};

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private dailySummaryTimer?: NodeJS.Timeout;
  private dailySummaryRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

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
        configured: Boolean(this.config.get<string>("OPENWA_API_URL")),
      },
      {
        key: "OPENWA_SESSION",
        label: "Sesion",
        configured: Boolean(this.config.get<string>("OPENWA_SESSION")),
      },
      {
        key: "OPENWA_API_KEY",
        label: "API key",
        configured: Boolean(this.config.get<string>("OPENWA_API_KEY")),
      },
      {
        key: "OPENWA_WEBHOOK_SECRET",
        label: "Webhook secret",
        configured: Boolean(this.config.get<string>("OPENWA_WEBHOOK_SECRET")),
      },
    ];
    const configured = checks.slice(0, 3).every((check) => check.configured);
    let reachable = false;
    let connectionError = "";

    if (configured) {
      const apiUrl = this.config.get<string>("OPENWA_API_URL")?.replace(/\/+$/, "");
      const apiKey = this.config.get<string>("OPENWA_API_KEY");
      if (apiUrl && apiKey) {
        try {
          await this.openWaRequest<unknown>(apiUrl, apiKey, "/sessions");
          reachable = true;
        } catch (error) {
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
    const apiUrl = this.config.get<string>("OPENWA_API_URL")?.replace(/\/+$/, "");
    const apiKey = this.config.get<string>("OPENWA_API_KEY");
    const sessionName = this.config.get<string>("OPENWA_SESSION");

    if (!apiUrl || !apiKey || !sessionName) {
      throw new BadRequestException("OpenWA is not configured");
    }

    const sessions = await this.openWaRequest<OpenWaSession[]>(apiUrl, apiKey, "/sessions");
    const stats = await this.safeOpenWaRequest<Record<string, unknown>>(apiUrl, apiKey, "/sessions/stats/overview", {});

    const session =
      sessions.find((item) => item.name === sessionName || item.id === sessionName) ??
      sessions.find((item) => item.status === "ready") ??
      sessions[0];

    if (!session) {
      throw new ServiceUnavailableException("No OpenWA session found");
    }

    const [chats, groups] = await Promise.all([
      this.safeOpenWaRequest<OpenWaChat[]>(apiUrl, apiKey, `/sessions/${session.id}/chats`, []),
      this.safeOpenWaRequest<OpenWaGroup[]>(apiUrl, apiKey, `/sessions/${session.id}/groups`, []),
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

  async send(dto: SendWhatsAppMessageDto) {
    const apiUrl = this.config.get<string>("OPENWA_API_URL")?.replace(/\/+$/, "");
    const apiKey = this.config.get<string>("OPENWA_API_KEY");
    const sessionName = this.config.get<string>("OPENWA_SESSION");

    if (!apiUrl || !apiKey || !sessionName) {
      throw new BadRequestException("OpenWA is not configured");
    }

    const sessions = await this.openWaRequest<OpenWaSession[]>(apiUrl, apiKey, "/sessions");
    const session =
      sessions.find((item) => item.name === sessionName || item.id === sessionName) ??
      sessions.find((item) => item.status === "ready") ??
      sessions[0];

    if (!session) {
      throw new ServiceUnavailableException("No OpenWA session found");
    }

    const to = dto.to.includes("@") ? dto.to.trim() : this.normalizePhone(dto.to);
    if (!to) {
      throw new BadRequestException("WhatsApp destination phone is required");
    }

    const chatId = to.includes("@") ? to : `${to}@c.us`;
    const forcedPath = this.config.get<string>("OPENWA_SEND_PATH");
    const result = await this.openWaSend(apiUrl, apiKey, session.id, [
      ...(forcedPath
        ? [
            {
              path: forcedPath,
              body: { chatId, text: dto.message },
            },
          ]
        : []),
      {
        path: `/sessions/${session.id}/messages/send-text`,
        body: { chatId, text: dto.message },
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

  async updateDailyMeetingSummary(dto: UpdateDailySummaryDto) {
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

  private async sendDailyMeetingSummaryIfDue() {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`No se pudo enviar resumen diario de reuniones: ${message}`);
    } finally {
      this.dailySummaryRunning = false;
    }
  }

  private async getOrCreateDailySummarySettings() {
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

  private async buildDailyMeetingSummaryPreview(template?: string) {
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

  private tomorrowRange() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    return { start, end, dateKey };
  }

  private formatMeetingSummaryLine(meeting: Meeting & { customer: { name: string; phone?: string | null; email?: string | null } }, index: number) {
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

  private meetingTypeLabel(type: MeetingType) {
    return type === "VIDEO_CALL" ? "Videollamada" : type === "PHONE" ? "Telefono" : "Presencial";
  }

  private async openWaRequest<T>(
    apiUrl: string,
    apiKey: string,
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    let response: Response;
    try {
      response = await this.fetchWithTimeout(`${apiUrl}/api${path}`, {
        method: options.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw new ServiceUnavailableException(`No se pudo conectar con OpenWA en ${apiUrl}`);
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(`OpenWA request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  private async safeOpenWaRequest<T>(
    apiUrl: string,
    apiKey: string,
    path: string,
    fallback: T,
    options: { method?: string; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    try {
      return await this.openWaRequest<T>(apiUrl, apiKey, path, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`OpenWA endpoint opcional omitido ${path}: ${message}`);
      return fallback;
    }
  }

  private async openWaSend(
    apiUrl: string,
    apiKey: string,
    sessionId: string,
    candidates: Array<{ path: string; body: Record<string, unknown> }>,
  ) {
    const firstAttempt = await this.tryOpenWaSend(apiUrl, apiKey, candidates);
    if (firstAttempt.result) {
      return firstAttempt.result;
    }

    if (firstAttempt.failures.some((failure) => failure.includes("sin conexion"))) {
      this.logger.warn("OpenWA no respondio al enviar. Reiniciando sesion y reintentando una vez.");
      await this.restartOpenWaSession(apiUrl, apiKey, sessionId);
      const secondAttempt = await this.tryOpenWaSend(apiUrl, apiKey, candidates);
      if (secondAttempt.result) {
        return secondAttempt.result;
      }

      throw new ServiceUnavailableException(`OpenWA send failed (${secondAttempt.failures.join(", ")})`);
    }

    throw new ServiceUnavailableException(`OpenWA send failed (${firstAttempt.failures.join(", ")})`);
  }

  private async tryOpenWaSend(
    apiUrl: string,
    apiKey: string,
    candidates: Array<{ path: string; body: Record<string, unknown> }>,
  ) {
    const failures: string[] = [];

    for (const candidate of candidates) {
      let response: Response;
      try {
        response = await this.fetchWithTimeout(`${apiUrl}/api${candidate.path}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify(candidate.body),
        }, 15000);
      } catch {
        failures.push(`${candidate.path}: sin conexion`);
        continue;
      }

      if (response.ok) {
        return { result: (await this.safeJson(response)) as Record<string, unknown>, failures };
      }

      failures.push(`${candidate.path}: ${response.status}${await this.responseFailureDetail(response)}`);
    }

    return { result: null, failures };
  }

  private async restartOpenWaSession(apiUrl: string, apiKey: string, sessionId: string) {
    await this.safeOpenWaRequest(apiUrl, apiKey, `/sessions/${sessionId}/stop`, {}, {
      method: "POST",
    });
    await this.sleep(1800);
    await this.safeOpenWaRequest(apiUrl, apiKey, `/sessions/${sessionId}/start`, {}, {
      method: "POST",
    });

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await this.sleep(1500);
      const session = await this.safeOpenWaRequest<OpenWaSession | null>(apiUrl, apiKey, `/sessions/${sessionId}`, null);
      if (session?.status === "ready") {
        return;
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async responseFailureDetail(response: Response) {
    try {
      const text = await response.text();
      return text ? ` ${text.slice(0, 180)}` : "";
    } catch {
      return "";
    }
  }

  private async safeJson(response: Response) {
    const text = await response.text();
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { response: text };
    }
  }

  private async fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ServiceUnavailableException(`OpenWA no respondio a tiempo en ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private normalizePhone(value: string) {
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

  private cleanNullable(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const clean = value.trim();
    return clean ? clean : null;
  }
}
