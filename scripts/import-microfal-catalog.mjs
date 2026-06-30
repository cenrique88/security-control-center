import fs from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sheetPath = ".tmp_microfal_xlsx/xl/worksheets/sheet1.xml";

function decodeXml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function parseMoney(value) {
  const clean = String(value ?? "").trim();
  if (!clean) {
    return null;
  }

  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferCategory(source) {
  const text = source.toUpperCase();
  if (text.includes("GPS")) return "GPS";
  if (text.includes("ACCESO") || text.includes("LECTORA") || text.includes("CERRADURA")) return "ACCESS_CONTROL";
  if (text.includes("CAMARA") || text.includes("CCTV") || text.includes("NVR") || text.includes("DVR")) return "CCTV";
  if (text.includes("PARADOX") || text.includes("ALARMA") || text.includes("SIRENA") || text.includes("DETECTOR")) return "ALARM";
  if (text.includes("SWITCH") || text.includes("ROUTER") || text.includes("RED")) return "NETWORKING";
  return "OTHER";
}

function cellColumn(reference) {
  return reference.replace(/\d+/g, "");
}

function cellText(cellXml) {
  const inlineMatch = cellXml.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/);
  if (inlineMatch) {
    return decodeXml(inlineMatch[1]);
  }

  const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
  return valueMatch ? decodeXml(valueMatch[1]) : "";
}

function parseRows(xml) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = {};
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const reference = cellMatch[1].match(/\br="([^"]+)"/)?.[1] ?? "";
      if (!reference) continue;
      row[cellColumn(reference)] = cellText(cellMatch[0]);
    }
    rows.push(row);
  }
  return rows;
}

const xml = await fs.readFile(sheetPath, "utf8");
const rows = parseRows(xml).slice(1);
const seen = new Set();
const items = [];

for (const row of rows) {
  const supplierCategory = row.A?.trim();
  const sku = row.B?.trim();
  const name = row.C?.trim();
  if (!sku || !name || seen.has(sku)) {
    continue;
  }

  seen.add(sku);
  items.push({
    sku,
    name,
    category: inferCategory(`${supplierCategory ?? ""} ${name}`),
    unit: "u",
    stock: 0,
    minStock: 0,
    managedStock: false,
    supplier: "Microfal",
    supplierCategory,
    costPrice: parseMoney(row.D),
    taxAmount: parseMoney(row.E),
    priceWithTax: parseMoney(row.F),
    currency: "USD",
  });
}

let created = 0;
for (let index = 0; index < items.length; index += 100) {
  const batch = items.slice(index, index + 100);
  const result = await prisma.inventoryItem.createMany({
    data: batch,
    skipDuplicates: true,
  });
  created += result.count;
}

console.log(JSON.stringify({ parsedRows: rows.length, uniqueSkus: items.length, created }, null, 2));
await prisma.$disconnect();
