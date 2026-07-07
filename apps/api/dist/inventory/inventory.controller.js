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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_inventory_item_dto_1 = require("./dto/create-inventory-item.dto");
const create_inventory_movement_dto_1 = require("./dto/create-inventory-movement.dto");
const inventory_service_1 = require("./inventory.service");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    list(search, category, lowStock, supplier, customerId, sourceType, mode) {
        return this.inventoryService.list({ search, category, lowStock, supplier, customerId, sourceType, mode });
    }
    summary() {
        return this.inventoryService.summary();
    }
    createItem(dto) {
        return this.inventoryService.createItem(dto);
    }
    updateItem(id, dto) {
        return this.inventoryService.updateItem(id, dto);
    }
    createMovement(dto) {
        return this.inventoryService.createMovement(dto);
    }
    deleteMovement(id) {
        return this.inventoryService.deleteMovement(id);
    }
    deleteItem(id) {
        return this.inventoryService.deleteItem(id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("category")),
    __param(2, (0, common_1.Query)("lowStock")),
    __param(3, (0, common_1.Query)("supplier")),
    __param(4, (0, common_1.Query)("customerId")),
    __param(5, (0, common_1.Query)("sourceType")),
    __param(6, (0, common_1.Query)("mode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "list", null);
__decorate([
    (0, common_1.Get)("summary"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inventory_item_dto_1.CreateInventoryItemDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_inventory_item_dto_1.CreateInventoryItemDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Post)("movements"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inventory_movement_dto_1.CreateInventoryMovementDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createMovement", null);
__decorate([
    (0, common_1.Delete)("movements/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteMovement", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteItem", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)("inventory"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map