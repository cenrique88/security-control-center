"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuelService = void 0;
const common_1 = require("@nestjs/common");
const OFFICIAL_FUEL_URL = "https://www.gub.uy/ministerio-industria-energia-mineria/comunicacion/noticias/precio-combustibles-julio-2026-baja-principales-combustibles-reduccion-100";
const FALLBACK_SUPER_PRICE = 88.67;
let FuelService = class FuelService {
    async getUruguaySuperPrice() {
        try {
            const response = await fetch(OFFICIAL_FUEL_URL, { cache: "no-store" });
            const html = await response.text();
            const match = html.match(/Nafta S(?:u|ú)per:\s*\$\s*([\d.,]+)/i);
            const price = match ? Number(match[1].replace(/\./g, "").replace(",", ".")) : FALLBACK_SUPER_PRICE;
            return {
                product: "Nafta Super",
                country: "UY",
                currency: "UYU",
                pricePerLiter: Number.isFinite(price) && price > 0 ? price : FALLBACK_SUPER_PRICE,
                source: OFFICIAL_FUEL_URL,
                updatedAt: new Date().toISOString(),
            };
        }
        catch {
            return {
                product: "Nafta Super",
                country: "UY",
                currency: "UYU",
                pricePerLiter: FALLBACK_SUPER_PRICE,
                source: OFFICIAL_FUEL_URL,
                updatedAt: new Date().toISOString(),
                fallback: true,
            };
        }
    }
};
exports.FuelService = FuelService;
exports.FuelService = FuelService = __decorate([
    (0, common_1.Injectable)()
], FuelService);
//# sourceMappingURL=fuel.service.js.map