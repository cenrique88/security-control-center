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
exports.SaveDispatchStopsDto = exports.SaveDispatchStopDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var DispatchPlaceTypeDto;
(function (DispatchPlaceTypeDto) {
    DispatchPlaceTypeDto["CLIENT"] = "CLIENT";
    DispatchPlaceTypeDto["FUTURE_CLIENT"] = "FUTURE_CLIENT";
    DispatchPlaceTypeDto["IMPORTER"] = "IMPORTER";
    DispatchPlaceTypeDto["WAREHOUSE"] = "WAREHOUSE";
    DispatchPlaceTypeDto["LUNCH"] = "LUNCH";
    DispatchPlaceTypeDto["TRANSFER"] = "TRANSFER";
    DispatchPlaceTypeDto["OTHER"] = "OTHER";
})(DispatchPlaceTypeDto || (DispatchPlaceTypeDto = {}));
class SaveDispatchStopDto {
    stopKey;
    placeType;
    title;
    address;
    latitude;
    longitude;
    customerId;
    siteId;
    workOrderId;
    supplierName;
    futureClientName;
    kind;
    zone;
    scheduledAt;
    durationMinutes;
    parkingCost;
    tollCost;
    notes;
    source;
}
exports.SaveDispatchStopDto = SaveDispatchStopDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "stopKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DispatchPlaceTypeDto),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "placeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDispatchStopDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDispatchStopDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "workOrderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "supplierName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "futureClientName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "zone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDispatchStopDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDispatchStopDto.prototype, "parkingCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveDispatchStopDto.prototype, "tollCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopDto.prototype, "source", void 0);
class SaveDispatchStopsDto {
    date;
    vehicleId;
    stops;
}
exports.SaveDispatchStopsDto = SaveDispatchStopsDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SaveDispatchStopsDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveDispatchStopsDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaveDispatchStopDto),
    __metadata("design:type", Array)
], SaveDispatchStopsDto.prototype, "stops", void 0);
//# sourceMappingURL=save-dispatch-stops.dto.js.map