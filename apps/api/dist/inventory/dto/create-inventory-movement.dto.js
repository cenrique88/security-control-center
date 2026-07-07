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
exports.CreateInventoryMovementDto = void 0;
const class_validator_1 = require("class-validator");
var InventoryMovementTypeDto;
(function (InventoryMovementTypeDto) {
    InventoryMovementTypeDto["IN"] = "IN";
    InventoryMovementTypeDto["OUT"] = "OUT";
    InventoryMovementTypeDto["ADJUST"] = "ADJUST";
})(InventoryMovementTypeDto || (InventoryMovementTypeDto = {}));
class CreateInventoryMovementDto {
    itemId;
    type;
    quantity;
    sourceType;
    customerId;
    reason;
    workOrderId;
    installedDeviceId;
}
exports.CreateInventoryMovementDto = CreateInventoryMovementDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "itemId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(InventoryMovementTypeDto),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInventoryMovementDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "sourceType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "workOrderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInventoryMovementDto.prototype, "installedDeviceId", void 0);
//# sourceMappingURL=create-inventory-movement.dto.js.map