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
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const add_work_order_material_dto_1 = require("./dto/add-work-order-material.dto");
const create_work_order_dto_1 = require("./dto/create-work-order.dto");
const return_work_order_material_dto_1 = require("./dto/return-work-order-material.dto");
const update_work_order_dto_1 = require("./dto/update-work-order.dto");
const work_orders_service_1 = require("./work-orders.service");
let WorkOrdersController = class WorkOrdersController {
    workOrdersService;
    constructor(workOrdersService) {
        this.workOrdersService = workOrdersService;
    }
    list(search, customerId, siteId, type, status) {
        return this.workOrdersService.list({ search, customerId, siteId, type, status });
    }
    create(dto) {
        return this.workOrdersService.create(dto);
    }
    addMaterial(id, dto) {
        return this.workOrdersService.addMaterial(id, dto);
    }
    returnMaterial(id, dto) {
        return this.workOrdersService.returnMaterial(id, dto);
    }
    reconcileCosts(id) {
        return this.workOrdersService.reconcileCosts(id);
    }
    update(id, dto) {
        return this.workOrdersService.update(id, dto);
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("customerId")),
    __param(2, (0, common_1.Query)("siteId")),
    __param(3, (0, common_1.Query)("type")),
    __param(4, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_order_dto_1.CreateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/materials"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_work_order_material_dto_1.AddWorkOrderMaterialDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "addMaterial", null);
__decorate([
    (0, common_1.Post)(":id/materials/return"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, return_work_order_material_dto_1.ReturnWorkOrderMaterialDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "returnMaterial", null);
__decorate([
    (0, common_1.Post)(":id/reconcile-costs"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "reconcileCosts", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_work_order_dto_1.UpdateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "update", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, common_1.Controller)("work-orders"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [work_orders_service_1.WorkOrdersService])
], WorkOrdersController);
//# sourceMappingURL=work-orders.controller.js.map