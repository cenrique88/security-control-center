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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GmailService = class GmailService {
    config;
    constructor(config) {
        this.config = config;
    }
    status() {
        const checks = [
            {
                key: "GMAIL_CLIENT_ID",
                label: "Client ID",
                configured: Boolean(this.config.get("GMAIL_CLIENT_ID")),
            },
            {
                key: "GMAIL_CLIENT_SECRET",
                label: "Client secret",
                configured: Boolean(this.config.get("GMAIL_CLIENT_SECRET")),
            },
            {
                key: "GMAIL_REDIRECT_URI",
                label: "Redirect URI",
                configured: Boolean(this.config.get("GMAIL_REDIRECT_URI")),
            },
            {
                key: "GMAIL_REFRESH_TOKEN",
                label: "Refresh token",
                configured: Boolean(this.config.get("GMAIL_REFRESH_TOKEN")),
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
        const inboxQuery = this.config.get("GMAIL_INBOX_QUERY") ?? "in:inbox category:primary";
        const [profile, inbox] = await Promise.all([
            this.gmailRequest(accessToken, "/gmail/v1/users/me/profile"),
            this.listMessages(accessToken, inboxQuery, 50),
        ]);
        const details = await Promise.all((inbox.messages ?? []).slice(0, 20).map((message) => this.getMessage(accessToken, message.id)));
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
    async send(dto) {
        const accessToken = await this.getAccessToken();
        const raw = this.toBase64Url(this.buildRawMessage(dto));
        const result = await this.gmailRequest(accessToken, "/gmail/v1/users/me/messages/send", {
            method: "POST",
            body: { raw },
        });
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
    buildRawMessage(dto) {
        if (!dto.attachment) {
            return [
                `To: ${dto.to}`,
                `Subject: ${this.encodeHeader(dto.subject)}`,
                "MIME-Version: 1.0",
                "Content-Type: text/plain; charset=UTF-8",
                "Content-Transfer-Encoding: 8bit",
                "",
                dto.message,
            ].join("\r\n");
        }
        const boundary = `sscc-${Date.now()}`;
        const attachment = this.parseDataUrl(dto.attachment.dataUrl);
        return [
            `To: ${dto.to}`,
            `Subject: ${this.encodeHeader(dto.subject)}`,
            "MIME-Version: 1.0",
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "",
            dto.message,
            "",
            `--${boundary}`,
            `Content-Type: ${dto.attachment.mimeType || attachment.mimeType}; name="${this.escapeHeader(dto.attachment.name)}"`,
            "Content-Transfer-Encoding: base64",
            `Content-Disposition: attachment; filename="${this.escapeHeader(dto.attachment.name)}"`,
            "",
            this.wrapBase64(attachment.base64),
            `--${boundary}--`,
            "",
        ].join("\r\n");
    }
    parseDataUrl(dataUrl) {
        const match = dataUrl.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/);
        if (!match) {
            throw new common_1.BadRequestException("Invalid attachment data");
        }
        return {
            mimeType: match[1] || "application/octet-stream",
            base64: match[2],
        };
    }
    wrapBase64(value) {
        return value.replace(/(.{76})/g, "$1\r\n");
    }
    escapeHeader(value) {
        return value.replace(/"/g, "'");
    }
    getAuthorizationUrl() {
        const clientId = this.config.get("GMAIL_CLIENT_ID");
        const redirectUri = this.config.get("GMAIL_REDIRECT_URI");
        if (!clientId || !redirectUri) {
            throw new common_1.BadRequestException("Gmail OAuth client id or redirect URI is not configured");
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
    async completeOAuth(code) {
        const clientId = this.config.get("GMAIL_CLIENT_ID");
        const clientSecret = this.config.get("GMAIL_CLIENT_SECRET");
        const redirectUri = this.config.get("GMAIL_REDIRECT_URI");
        if (!clientId || !clientSecret || !redirectUri) {
            throw new common_1.BadRequestException("Gmail OAuth is not configured");
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
        const data = (await response.json());
        if (!response.ok) {
            throw new common_1.ServiceUnavailableException(data.error_description ?? data.error ?? `Gmail OAuth request failed: ${response.status}`);
        }
        if (!data.refresh_token) {
            throw new common_1.ServiceUnavailableException("Google did not return a refresh token");
        }
        return {
            refreshToken: data.refresh_token,
        };
    }
    async getAccessToken() {
        const clientId = this.config.get("GMAIL_CLIENT_ID");
        const clientSecret = this.config.get("GMAIL_CLIENT_SECRET");
        const refreshToken = this.config.get("GMAIL_REFRESH_TOKEN");
        if (!clientId || !clientSecret || !refreshToken) {
            throw new common_1.BadRequestException("Gmail OAuth is not configured");
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
        const data = (await response.json().catch(() => ({})));
        if (!response.ok) {
            throw new common_1.ServiceUnavailableException(data.error_description ?? data.error ?? `Gmail token request failed: ${response.status}`);
        }
        if (!data.access_token) {
            throw new common_1.ServiceUnavailableException("Gmail did not return an access token");
        }
        return data.access_token;
    }
    listMessages(accessToken, query, maxResults) {
        return this.gmailRequest(accessToken, `/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    }
    getMessage(accessToken, id) {
        return this.gmailRequest(accessToken, `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`);
    }
    async gmailRequest(accessToken, path, options = {}) {
        const response = await fetch(`https://gmail.googleapis.com${path}`, {
            method: options.method ?? "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            throw new common_1.ServiceUnavailableException(`Gmail request failed: ${response.status}`);
        }
        return response.json();
    }
    toMessageSummary(message) {
        const headers = message.payload?.headers ?? [];
        const getHeader = (name) => headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? "";
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
    toBase64Url(value) {
        return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    encodeHeader(value) {
        return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
    }
};
exports.GmailService = GmailService;
exports.GmailService = GmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GmailService);
//# sourceMappingURL=gmail.service.js.map