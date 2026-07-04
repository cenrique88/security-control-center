import { Injectable } from "@nestjs/common";

const OFFICIAL_FUEL_URL =
  "https://www.gub.uy/ministerio-industria-energia-mineria/comunicacion/noticias/precio-combustibles-julio-2026-baja-principales-combustibles-reduccion-100";
const FALLBACK_SUPER_PRICE = 88.67;

@Injectable()
export class FuelService {
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
    } catch {
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
}
