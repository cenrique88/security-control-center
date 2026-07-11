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
exports.DispatchController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const dispatch_service_1 = require("./dispatch.service");
const save_dispatch_stops_dto_1 = require("./dto/save-dispatch-stops.dto");
let DispatchController = class DispatchController {
    dispatchService;
    constructor(dispatchService) {
        this.dispatchService = dispatchService;
    }
    listStops(date, vehicleId) {
        return this.dispatchService.list(date, vehicleId);
    }
    places() {
        return this.dispatchService.places();
    }
    saveStops(dto) {
        return this.dispatchService.save(dto);
    }
    syncTraccar(date, vehicleId) {
        return this.dispatchService.syncTraccar(date, vehicleId);
    }
    suppliers() {
        return this.dispatchService.suppliers();
    }
};
exports.DispatchController = DispatchController;
__decorate([
    (0, common_1.Get)("stops"),
    __param(0, (0, common_1.Query)("date")),
    __param(1, (0, common_1.Query)("vehicleId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "listStops", null);
__decorate([
    (0, common_1.Get)("places"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "places", null);
__decorate([
    (0, common_1.Patch)("stops"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_dispatch_stops_dto_1.SaveDispatchStopsDto]),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "saveStops", null);
__decorate([
    (0, common_1.Post)("traccar/sync"),
    __param(0, (0, common_1.Query)("date")),
    __param(1, (0, common_1.Query)("vehicleId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "syncTraccar", null);
__decorate([
    (0, common_1.Get)("suppliers"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DispatchController.prototype, "suppliers", null);
exports.DispatchController = DispatchController = __decorate([
    (0, common_1.Controller)("dispatch"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.TECHNICIAN, client_1.UserRole.MONITORING),
    __metadata("design:paramtypes", [dispatch_service_1.DispatchService])
], DispatchController);
//# sourceMappingURL=dispatch.controller.js.map