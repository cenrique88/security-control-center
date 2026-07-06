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
exports.GmailController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const send_gmail_message_dto_1 = require("./dto/send-gmail-message.dto");
const gmail_service_1 = require("./gmail.service");
let GmailController = class GmailController {
    gmailService;
    constructor(gmailService) {
        this.gmailService = gmailService;
    }
    status() {
        return this.gmailService.status();
    }
    sync() {
        return this.gmailService.sync();
    }
    send(dto) {
        return this.gmailService.send(dto);
    }
};
exports.GmailController = GmailController;
__decorate([
    (0, common_1.Get)("status"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GmailController.prototype, "status", null);
__decorate([
    (0, common_1.Get)("sync"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GmailController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)("send"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_gmail_message_dto_1.SendGmailMessageDto]),
    __metadata("design:returntype", void 0)
], GmailController.prototype, "send", null);
exports.GmailController = GmailController = __decorate([
    (0, common_1.Controller)("gmail"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [gmail_service_1.GmailService])
], GmailController);
//# sourceMappingURL=gmail.controller.js.map