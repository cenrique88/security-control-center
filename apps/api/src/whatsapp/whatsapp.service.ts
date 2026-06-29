import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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

  private async openWaRequest<T>(apiUrl: string, apiKey: string, path: string): Promise<T> {
    const response = await fetch(`${apiUrl}/api${path}`, {
      headers: {
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`OpenWA request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}
