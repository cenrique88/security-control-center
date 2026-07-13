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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const send_traccar_command_dto_1 = require("./dto/send-traccar-command.dto");
const update_traccar_settings_dto_1 = require("./dto/update-traccar-settings.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const vehicles_service_1 = require("./vehicles.service");
let VehiclesController = class VehiclesController {
    vehiclesService;
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    list(search, active) {
        return this.vehiclesService.list({
            search,
            active: active === undefined ? undefined : active === "true",
        });
    }
    getTraccarSettings() {
        return this.vehiclesService.getTraccarSettings();
    }
    updateTraccarSettings(dto) {
        return this.vehiclesService.updateTraccarSettings(dto);
    }
    syncTraccarGeofences() {
        return this.vehiclesService.syncCustomerGeofences();
    }
    traccarDaily(id, date) {
        return this.vehiclesService.traccarDailySummary(id, date);
    }
    registerDailyFuelExpense(id, date) {
        return this.vehiclesService.registerDailyFuelExpense(id, date);
    }
    traccarLive(id) {
        return this.vehiclesService.traccarLivePosition(id);
    }
    traccarEvents(id, date) {
        return this.vehiclesService.traccarEvents(id, date);
    }
    traccarAlertLogs(id) {
        return this.vehiclesService.traccarAlertLogs(id);
    }
    sendTraccarCommand(id, dto) {
        return this.vehiclesService.sendTraccarCommand(id, dto);
    }
    sendVehicleTestWhatsApp(id) {
        return this.vehiclesService.sendVehicleTestWhatsApp(id);
    }
    syncVehicleAlerts(id) {
        return this.vehiclesService.syncVehicleAlerts(id);
    }
    configureTraccarNotifications(id) {
        return this.vehiclesService.configureTraccarNotifications(id);
    }
    create(dto) {
        return this.vehiclesService.create(dto);
    }
    update(id, dto) {
        return this.vehiclesService.update(id, dto);
    }
    remove(id) {
        return this.vehiclesService.remove(id);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("active")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("traccar/settings"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getTraccarSettings", null);
__decorate([
    (0, common_1.Patch)("traccar/settings"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_traccar_settings_dto_1.UpdateTraccarSettingsDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "updateTraccarSettings", null);
__decorate([
    (0, common_1.Post)("traccar/geofences/sync"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "syncTraccarGeofences", null);
__decorate([
    (0, common_1.Get)(":id/traccar/daily"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("date")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "traccarDaily", null);
__decorate([
    (0, common_1.Post)(":id/traccar/daily/fuel-expense"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("date")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "registerDailyFuelExpense", null);
__decorate([
    (0, common_1.Get)(":id/traccar/live"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "traccarLive", null);
__decorate([
    (0, common_1.Get)(":id/traccar/events"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("date")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "traccarEvents", null);
__decorate([
    (0, common_1.Get)(":id/traccar/alerts"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "traccarAlertLogs", null);
__decorate([
    (0, common_1.Post)(":id/traccar/command"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_traccar_command_dto_1.SendTraccarCommandDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "sendTraccarCommand", null);
__decorate([
    (0, common_1.Post)(":id/traccar/test-whatsapp"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "sendVehicleTestWhatsApp", null);
__decorate([
    (0, common_1.Post)(":id/traccar/sync-alerts"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "syncVehicleAlerts", null);
__decorate([
    (0, common_1.Post)(":id/traccar/notifications/configure"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "configureTraccarNotifications", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, common_1.Controller)("vehicles"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MONITORING),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map