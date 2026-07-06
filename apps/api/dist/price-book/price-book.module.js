"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBookModule = void 0;
const common_1 = require("@nestjs/common");
const price_book_controller_1 = require("./price-book.controller");
const price_book_service_1 = require("./price-book.service");
let PriceBookModule = class PriceBookModule {
};
exports.PriceBookModule = PriceBookModule;
exports.PriceBookModule = PriceBookModule = __decorate([
    (0, common_1.Module)({
        controllers: [price_book_controller_1.PriceBookController],
        providers: [price_book_service_1.PriceBookService],
    })
], PriceBookModule);
//# sourceMappingURL=price-book.module.js.map