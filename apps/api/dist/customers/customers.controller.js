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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const customers_service_1 = require("./customers.service");
const create_customer_document_dto_1 = require("./dto/create-customer-document.dto");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const create_site_dto_1 = require("./dto/create-site.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    list(search, status, type) {
        return this.customersService.list({ search, status, type });
    }
    create(dto) {
        return this.customersService.create(dto);
    }
    update(id, dto) {
        return this.customersService.update(id, dto);
    }
    profile(id) {
        return this.customersService.profile(id);
    }
    listSites(id) {
        return this.customersService.listSites(id);
    }
    createSite(id, dto) {
        return this.customersService.createSite(id, dto);
    }
    createDocument(id, dto) {
        return this.customersService.createDocument(id, dto);
    }
    deleteDocument(id, documentId) {
        return this.customersService.deleteDocument(id, documentId);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("status")),
    __param(2, (0, common_1.Query)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(":id/profile"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "profile", null);
__decorate([
    (0, common_1.Get)(":id/sites"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "listSites", null);
__decorate([
    (0, common_1.Post)(":id/sites"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_site_dto_1.CreateSiteDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "createSite", null);
__decorate([
    (0, common_1.Post)(":id/documents"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_customer_document_dto_1.CreateCustomerDocumentDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Delete)(":id/documents/:documentId"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("documentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "deleteDocument", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)("customers"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map