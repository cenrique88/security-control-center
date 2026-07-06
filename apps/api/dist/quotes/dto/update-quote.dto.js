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
exports.UpdateQuoteDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const create_quote_dto_1 = require("./create-quote.dto");
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
var QuoteStatusDto;
(function (QuoteStatusDto) {
    QuoteStatusDto["DRAFT"] = "DRAFT";
    QuoteStatusDto["SENT"] = "SENT";
    QuoteStatusDto["APPROVED"] = "APPROVED";
    QuoteStatusDto["REJECTED"] = "REJECTED";
    QuoteStatusDto["EXPIRED"] = "EXPIRED";
})(QuoteStatusDto || (QuoteStatusDto = {}));
var QuotePricingModeDto;
(function (QuotePricingModeDto) {
    QuotePricingModeDto["DIRECT"] = "DIRECT";
    QuotePricingModeDto["THIRD_PARTY"] = "THIRD_PARTY";
    QuotePricingModeDto["MANUAL"] = "MANUAL";
})(QuotePricingModeDto || (QuotePricingModeDto = {}));
class UpdateQuoteDto {
    customerId;
    number;
    title;
    meetingId;
    service;
    status;
    pricingMode;
    currency;
    issueDate;
    validUntil;
    taxIncluded;
    discountPercent;
    discountAmount;
    profitMarginPercent;
    laborPoints;
    subtotal;
    tax;
    acceptedAt;
    internalNotes;
    commercialTerms;
    executionTime;
    warranty;
    paymentTerms;
    items;
}
exports.UpdateQuoteDto = UpdateQuoteDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "meetingId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ServiceTypeDto),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "service", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(QuoteStatusDto),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(QuotePricingModeDto),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "pricingMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "issueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "validUntil", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateQuoteDto.prototype, "taxIncluded", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "discountPercent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "discountAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "profitMarginPercent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "laborPoints", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "subtotal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuoteDto.prototype, "tax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "acceptedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "internalNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "commercialTerms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "executionTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "warranty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQuoteDto.prototype, "paymentTerms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_quote_dto_1.CreateQuoteItemDto),
    __metadata("design:type", Array)
], UpdateQuoteDto.prototype, "items", void 0);
//# sourceMappingURL=update-quote.dto.js.map