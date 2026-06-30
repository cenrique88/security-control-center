import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendGmailMessageDto } from "./dto/send-gmail-message.dto";

type GmailMessageList = {
  messages?: Array<{ id: string; threadId: string }>;
  resultSizeEstimate?: number;
};

type GmailMessage = {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{
      name: string;
      value: string;
    }>;
  };
};

@Injectable()
export class GmailService {
  constructor(private readonly config: ConfigService) {}

  status() {
    const checks = [
      {
        key: "GMAIL_CLIENT_ID",
        label: "Client ID",
        configured: Boolean(this.config.get<string>("GMAIL_CLIENT_ID")),
      },
      {
        key: "GMAIL_CLIENT_SECRET",
        label: "Client secret",
        configured: Boolean(this.config.get<string>("GMAIL_CLIENT_SECRET")),
      },
      {
        key: "GMAIL_REDIRECT_URI",
        label: "Redirect URI",
        configured: Boolean(this.config.get<string>("GMAIL_REDIRECT_URI")),
      },
      {
        key: "GMAIL_REFRESH_TOKEN",
        label: "Refresh token",
        configured: Boolean(this.config.get<string>("GMAIL_REFRESH_TOKEN")),
      },
    ];

    return {
      provider: "Gmail",
      connected: checks.every((check) => check.configured),
      lastSyncAt: null,
      unread: 0,
      important: 0,
      pendingReplies: 0,
      checks,
    };
  }

  async sync() {
    const accessToken = await this.getAccessToken();
    const inboxQuery = this.config.get<string>("GMAIL_INBOX_QUERY") ?? "in:inbox category:primary";
    const [profile, inbox] = await Promise.all([
      this.gmailRequest<{ emailAddress: string; messagesTotal: number; threadsTotal: number }>(
        accessToken,
        "/gmail/v1/users/me/profile",
      ),
      this.listMessages(accessToken, inboxQuery, 50),
    ]);

    const details = await Promise.all(
      (inbox.messages ?? []).slice(0, 20).map((message) => this.getMessage(accessToken, message.id)),
    );
    const unreadCount = details.filter((message) => message.labelIds?.includes("UNREAD")).length;
    const importantCount = details.filter((message) => message.labelIds?.includes("IMPORTANT")).length;

    return {
      provider: "Gmail",
      connected: true,
      lastSyncAt: new Date().toISOString(),
      emailAddress: profile.emailAddress,
      unread: unreadCount,
      important: importantCount,
      pendingReplies: unreadCount,
      messagesTotal: profile.messagesTotal,
      threadsTotal: profile.threadsTotal,
      messages: details.map((message) => this.toMessageSummary(message)),
    };
  }

  async send(dto: SendGmailMessageDto) {
    const accessToken = await this.getAccessToken();
    const raw = this.toBase64Url(
      [
        `To: ${dto.to}`,
        `Subject: ${this.encodeHeader(dto.subject)}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        dto.message,
      ].join("\r\n"),
    );

    const result = await this.gmailRequest<{ id: string; threadId?: string }>(
      accessToken,
      "/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        body: { raw },
      },
    );

    return {
      provider: "Gmail",
      sent: true,
      to: dto.to,
      subject: dto.subject,
      sentAt: new Date().toISOString(),
      messageId: result.id,
      threadId: result.threadId,
    };
  }

  getAuthorizationUrl() {
    const clientId = this.config.get<string>("GMAIL_CLIENT_ID");
    const redirectUri = this.config.get<string>("GMAIL_REDIRECT_URI");

    if (!clientId || !redirectUri) {
      throw new BadRequestException("Gmail OAuth client id or redirect URI is not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
      access_type: "offline",
      prompt: "consent",
    });

    return {
      authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      redirectUri,
    };
  }

  async completeOAuth(code: string) {
    const clientId = this.config.get<string>("GMAIL_CLIENT_ID");
    const clientSecret = this.config.get<string>("GMAIL_CLIENT_SECRET");
    const redirectUri = this.config.get<string>("GMAIL_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException("Gmail OAuth is not configured");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const data = (await response.json()) as {
      refresh_token?: string;
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!response.ok) {
      throw new ServiceUnavailableException(
        data.error_description ?? data.error ?? `Gmail OAuth request failed: ${response.status}`,
      );
    }

    if (!data.refresh_token) {
      throw new ServiceUnavailableException("Google did not return a refresh token");
    }

    return {
      refreshToken: data.refresh_token,
    };
  }

  private async getAccessToken() {
    const clientId = this.config.get<string>("GMAIL_CLIENT_ID");
    const clientSecret = this.config.get<string>("GMAIL_CLIENT_SECRET");
    const refreshToken = this.config.get<string>("GMAIL_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !refreshToken) {
      throw new BadRequestException("Gmail OAuth is not configured");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Gmail token request failed: ${response.status}`);
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new ServiceUnavailableException("Gmail did not return an access token");
    }

    return data.access_token;
  }

  private listMessages(accessToken: string, query: string, maxResults: number) {
    return this.gmailRequest<GmailMessageList>(
      accessToken,
      `/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    );
  }

  private getMessage(accessToken: string, id: string) {
    return this.gmailRequest<GmailMessage>(
      accessToken,
      `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    );
  }

  private async gmailRequest<T>(
    accessToken: string,
    path: string,
    options: { method?: string; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    const response = await fetch(`https://gmail.googleapis.com${path}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Gmail request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  private toMessageSummary(message: GmailMessage) {
    const headers = message.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? "";

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader("From"),
      subject: getHeader("Subject") || "(Sin asunto)",
      date: getHeader("Date"),
      snippet: message.snippet ?? "",
      unread: message.labelIds?.includes("UNREAD") ?? false,
      important: message.labelIds?.includes("IMPORTANT") ?? false,
    };
  }

  private toBase64Url(value: string) {
    return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  private encodeHeader(value: string) {
    return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
  }
}
