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
exports.UpdateWorkOrderDto = void 0;
const class_validator_1 = require("class-validator");
var ServiceTypeDto;
(function (ServiceTypeDto) {
    ServiceTypeDto["CCTV"] = "CCTV";
    ServiceTypeDto["ALARM"] = "ALARM";
    ServiceTypeDto["ACCESS_CONTROL"] = "ACCESS_CONTROL";
    ServiceTypeDto["CABLING"] = "CABLING";
    ServiceTypeDto["GPS"] = "GPS";
    ServiceTypeDto["ELECTRIC_FENCE"] = "ELECTRIC_FENCE";
    ServiceTypeDto["AUTOMATION"] = "AUTOMATION";
    ServiceTypeDto["NETWORKING"] = "NETWORKING";
    ServiceTypeDto["MAINTENANCE"] = "MAINTENANCE";
    ServiceTypeDto["OTHER"] = "OTHER";
})(ServiceTypeDto || (ServiceTypeDto = {}));
var WorkOrderStatusDto;
(function (WorkOrderStatusDto) {
    WorkOrderStatusDto["SCHEDULED"] = "SCHEDULED";
    WorkOrderStatusDto["IN_PROGRESS"] = "IN_PROGRESS";
    WorkOrderStatusDto["WAITING_CUSTOMER"] = "WAITING_CUSTOMER";
    WorkOrderStatusDto["COMPLETED"] = "COMPLETED";
    WorkOrderStatusDto["CANCELLED"] = "CANCELLED";
})(WorkOrderStatusDto || (WorkOrderStatusDto = {}));
class UpdateWorkOrderDto {
    customerId;
    siteId;
    title;
    type;
    status;
    scheduledAt;
    completedAt;
    notes;
    reportBeforeNotes;
    reportAfterNotes;
    reportTasks;
    reportTests;
    reportRecommendations;
    reportPhotos;
}
exports.UpdateWorkOrderDto = UpdateWorkOrderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ServiceTypeDto),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(WorkOrderStatusDto),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "completedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "reportBeforeNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "reportAfterNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "reportTasks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "reportTests", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "reportRecommendations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateWorkOrderDto.prototype, "reportPhotos", void 0);
//# sourceMappingURL=update-work-order.dto.js.map