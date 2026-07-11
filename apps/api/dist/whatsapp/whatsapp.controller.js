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
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const send_whatsapp_message_dto_1 = require("./dto/send-whatsapp-message.dto");
const update_daily_summary_dto_1 = require("./dto/update-daily-summary.dto");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsAppController = class WhatsAppController {
    whatsAppService;
    constructor(whatsAppService) {
        this.whatsAppService = whatsAppService;
    }
    status() {
        return this.whatsAppService.status();
    }
    sync() {
        return this.whatsAppService.sync();
    }
    send(dto) {
        return this.whatsAppService.send(dto);
    }
    dailyMeetingSummary() {
        return this.whatsAppService.getDailyMeetingSummary();
    }
    updateDailyMeetingSummary(dto) {
        return this.whatsAppService.updateDailyMeetingSummary(dto);
    }
    sendDailyMeetingSummary() {
        return this.whatsAppService.sendDailyMeetingSummaryNow();
    }
};
exports.WhatsAppController = WhatsAppController;
__decorate([
    (0, common_1.Get)("status"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "status", null);
__decorate([
    (0, common_1.Get)("sync"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)("send"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_whatsapp_message_dto_1.SendWhatsAppMessageDto]),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "send", null);
__decorate([
    (0, common_1.Get)("daily-meeting-summary"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "dailyMeetingSummary", null);
__decorate([
    (0, common_1.Patch)("daily-meeting-summary"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_daily_summary_dto_1.UpdateDailySummaryDto]),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "updateDailyMeetingSummary", null);
__decorate([
    (0, common_1.Post)("daily-meeting-summary/send"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WhatsAppController.prototype, "sendDailyMeetingSummary", null);
exports.WhatsAppController = WhatsAppController = __decorate([
    (0, common_1.Controller)("whatsapp"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.MONITORING),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService])
], WhatsAppController);
//# sourceMappingURL=whatsapp.controller.js.map