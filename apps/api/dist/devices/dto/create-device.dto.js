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
exports.CreateDeviceDto = void 0;
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
class CreateDeviceDto {
    siteId;
    type;
    brand;
    model;
    serial;
    ipAddress;
    installedAt;
    notes;
}
exports.CreateDeviceDto = CreateDeviceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ServiceTypeDto),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "serial", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "ipAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "installedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDto.prototype, "notes", void 0);
//# sourceMappingURL=create-device.dto.js.map