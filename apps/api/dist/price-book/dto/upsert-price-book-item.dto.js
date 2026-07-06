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
exports.UpsertPriceBookItemDto = void 0;
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
var QuoteItemTypeDto;
(function (QuoteItemTypeDto) {
    QuoteItemTypeDto["EQUIPMENT"] = "EQUIPMENT";
    QuoteItemTypeDto["MATERIAL"] = "MATERIAL";
    QuoteItemTypeDto["SUPPLY"] = "SUPPLY";
    QuoteItemTypeDto["LABOR"] = "LABOR";
    QuoteItemTypeDto["EXPENSE"] = "EXPENSE";
})(QuoteItemTypeDto || (QuoteItemTypeDto = {}));
class UpsertPriceBookItemDto {
    code;
    name;
    type;
    category;
    service;
    brand;
    model;
    description;
    unit;
    costPrice;
    salePrice;
    taxRate;
    currency;
    active;
}
exports.UpsertPriceBookItemDto = UpsertPriceBookItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(QuoteItemTypeDto),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ServiceTypeDto),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "service", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpsertPriceBookItemDto.prototype, "costPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpsertPriceBookItemDto.prototype, "salePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpsertPriceBookItemDto.prototype, "taxRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertPriceBookItemDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpsertPriceBookItemDto.prototype, "active", void 0);
//# sourceMappingURL=upsert-price-book-item.dto.js.map