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
exports.PriceBookController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const update_labor_point_rate_dto_1 = require("./dto/update-labor-point-rate.dto");
const upsert_customer_labor_point_rate_dto_1 = require("./dto/upsert-customer-labor-point-rate.dto");
const upsert_customer_price_override_dto_1 = require("./dto/upsert-customer-price-override.dto");
const upsert_price_book_item_dto_1 = require("./dto/upsert-price-book-item.dto");
const price_book_service_1 = require("./price-book.service");
let PriceBookController = class PriceBookController {
    priceBookService;
    constructor(priceBookService) {
        this.priceBookService = priceBookService;
    }
    list(search, category, service, type, active) {
        return this.priceBookService.list({ search, category, service, type, active });
    }
    create(dto) {
        return this.priceBookService.create(dto);
    }
    laborRates(customerId) {
        return this.priceBookService.laborRates(customerId);
    }
    calculateLaborPoints(points, rateId, customerId) {
        return this.priceBookService.calculateLaborPoints(Number(points) || 0, rateId, customerId);
    }
    updateLaborRate(id, dto) {
        return this.priceBookService.updateLaborRate(id, dto);
    }
    customerLaborRates(customerId) {
        return this.priceBookService.customerLaborRates(customerId);
    }
    createCustomerLaborRate(dto) {
        return this.priceBookService.createCustomerLaborRate(dto);
    }
    updateCustomerLaborRate(id, dto) {
        return this.priceBookService.updateCustomerLaborRate(id, dto);
    }
    customerPriceOverrides(customerId) {
        return this.priceBookService.customerPriceOverrides(customerId);
    }
    upsertCustomerPriceOverride(dto) {
        return this.priceBookService.upsertCustomerPriceOverride(dto);
    }
    updateCustomerPriceOverride(id, dto) {
        return this.priceBookService.updateCustomerPriceOverride(id, dto);
    }
    update(id, dto) {
        return this.priceBookService.update(id, dto);
    }
};
exports.PriceBookController = PriceBookController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("category")),
    __param(2, (0, common_1.Query)("service")),
    __param(3, (0, common_1.Query)("type")),
    __param(4, (0, common_1.Query)("active")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_price_book_item_dto_1.UpsertPriceBookItemDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("labor-points"),
    __param(0, (0, common_1.Query)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "laborRates", null);
__decorate([
    (0, common_1.Get)("labor-points/calculate"),
    __param(0, (0, common_1.Query)("points")),
    __param(1, (0, common_1.Query)("rateId")),
    __param(2, (0, common_1.Query)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "calculateLaborPoints", null);
__decorate([
    (0, common_1.Patch)("labor-points/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_labor_point_rate_dto_1.UpdateLaborPointRateDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "updateLaborRate", null);
__decorate([
    (0, common_1.Get)("customer-labor-rates"),
    __param(0, (0, common_1.Query)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "customerLaborRates", null);
__decorate([
    (0, common_1.Post)("customer-labor-rates"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_customer_labor_point_rate_dto_1.UpsertCustomerLaborPointRateDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "createCustomerLaborRate", null);
__decorate([
    (0, common_1.Patch)("customer-labor-rates/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_customer_labor_point_rate_dto_1.UpsertCustomerLaborPointRateDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "updateCustomerLaborRate", null);
__decorate([
    (0, common_1.Get)("customer-price-overrides"),
    __param(0, (0, common_1.Query)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "customerPriceOverrides", null);
__decorate([
    (0, common_1.Post)("customer-price-overrides"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_customer_price_override_dto_1.UpsertCustomerPriceOverrideDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "upsertCustomerPriceOverride", null);
__decorate([
    (0, common_1.Patch)("customer-price-overrides/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_customer_price_override_dto_1.UpsertCustomerPriceOverrideDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "updateCustomerPriceOverride", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_price_book_item_dto_1.UpsertPriceBookItemDto]),
    __metadata("design:returntype", void 0)
], PriceBookController.prototype, "update", null);
exports.PriceBookController = PriceBookController = __decorate([
    (0, common_1.Controller)("price-book"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [price_book_service_1.PriceBookService])
], PriceBookController);
//# sourceMappingURL=price-book.controller.js.map