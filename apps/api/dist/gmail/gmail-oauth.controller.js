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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailOAuthController = void 0;
const common_1 = require("@nestjs/common");
const gmail_service_1 = require("./gmail.service");
let GmailOAuthController = class GmailOAuthController {
    gmailService;
    constructor(gmailService) {
        this.gmailService = gmailService;
    }
    authorizationUrl() {
        return this.gmailService.getAuthorizationUrl();
    }
    async callback(code, error) {
        if (error) {
            return {
                ok: false,
                error,
            };
        }
        if (!code) {
            return {
                ok: false,
                error: "Google did not return an authorization code",
            };
        }
        const result = await this.gmailService.completeOAuth(code);
        return {
            ok: true,
            message: "Copy this value into GMAIL_REFRESH_TOKEN in the .env file, then restart the API.",
            env: `GMAIL_REFRESH_TOKEN="${result.refreshToken}"`,
        };
    }
};
exports.GmailOAuthController = GmailOAuthController;
__decorate([
    (0, common_1.Get)("url"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GmailOAuthController.prototype, "authorizationUrl", null);
__decorate([
    (0, common_1.Get)("callback"),
    __param(0, (0, common_1.Query)("code")),
    __param(1, (0, common_1.Query)("error")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GmailOAuthController.prototype, "callback", null);
exports.GmailOAuthController = GmailOAuthController = __decorate([
    (0, common_1.Controller)("gmail/oauth"),
    __metadata("design:paramtypes", [gmail_service_1.GmailService])
], GmailOAuthController);
//# sourceMappingURL=gmail-oauth.controller.js.map