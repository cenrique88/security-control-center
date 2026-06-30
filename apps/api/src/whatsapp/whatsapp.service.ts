import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendWhatsAppMessageDto } from "./dto/send-whatsapp-message.dto";

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
};

type OpenWaGroup = {
  id: string;
  name?: string;
};

@Injectable()
export class WhatsAppService {
  constructor(private readonly config: ConfigService) {}

  status() {
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

    return {
      provider: "OpenWA",
      connected: checks.slice(0, 3).every((check) => check.configured),
      lastSyncAt: null,
      unread: 0,
      pendingReplies: 0,
      activeChats: 0,
      checks,
    };
  }

  async sync() {
    const apiUrl = this.config.get<string>("OPENWA_API_URL")?.replace(/\/+$/, "");
    const apiKey = this.config.get<string>("OPENWA_API_KEY");
    const sessionName = this.config.get<string>("OPENWA_SESSION");

    if (!apiUrl || !apiKey || !sessionName) {
      throw new BadRequestException("OpenWA is not configured");
    }

    const [sessions, stats] = await Promise.all([
      this.openWaRequest<OpenWaSession[]>(apiUrl, apiKey, "/sessions"),
      this.openWaRequest<Record<string, unknown>>(apiUrl, apiKey, "/sessions/stats/overview"),
    ]);

    const session =
      sessions.find((item) => item.name === sessionName || item.id === sessionName) ??
      sessions.find((item) => item.status === "ready") ??
      sessions[0];

    if (!session) {
      throw new ServiceUnavailableException("No OpenWA session found");
    }

    const [chats, groups] = await Promise.all([
      this.openWaRequest<OpenWaChat[]>(apiUrl, apiKey, `/sessions/${session.id}/chats`),
      this.openWaRequest<OpenWaGroup[]>(apiUrl, apiKey, `/sessions/${session.id}/groups`),
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
        body: { chatId, text: dto.message },
      },
      {
        path: "/sendText",
        body: { session: session.name ?? session.id, chatId, text: dto.message },
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

  private async openWaRequest<T>(
    apiUrl: string,
    apiKey: string,
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    const response = await fetch(`${apiUrl}/api${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`OpenWA request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  private async openWaSend(
    apiUrl: string,
    apiKey: string,
    candidates: Array<{ path: string; body: Record<string, unknown> }>,
  ) {
    const failures: string[] = [];

    for (const candidate of candidates) {
      const response = await fetch(`${apiUrl}/api${candidate.path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(candidate.body),
      });

      if (response.ok) {
        return (await this.safeJson(response)) as Record<string, unknown>;
      }

      failures.push(`${candidate.path}: ${response.status}`);
    }

    throw new ServiceUnavailableException(`OpenWA send failed (${failures.join(", ")})`);
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
}
