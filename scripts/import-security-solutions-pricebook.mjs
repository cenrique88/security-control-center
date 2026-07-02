import fs from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const sourcePath = process.argv[2] ?? "tmp_catalogo_security_solutions.txt";
const TAX_RATE = 22;

const titleByService = [
  [/control de acceso|cerraduras/i, "ACCESS_CONTROL"],
  [/cableado|internet|redes|infraestructura/i, "CABLING"],
  [/cerco/i, "ELECTRIC_FENCE"],
  [/gps|rastreo/i, "GPS"],
  [/incendio/i, "OTHER"],
  [/comodato/i, "OTHER"],
];

const sectionHeadings = new Set([
  "Sistemas de Control de Acceso",
  "Equipos y Dispositivos",
  "Automatización y Accesorios",
  "Cableado e Infraestructura",
  "Mantenimiento Control de Acceso",
  "Cableado Estructurado",
  "Redes e Internet",
  "WiFi y Conectividad",
  "Equipos de Red",
  "Mantenimiento y Soporte",
  "Sistemas de Cerco Eléctrico",
  "Energizadores y Centrales",
  "Materiales y Accesorios",
  "Integración y Automatización",
  "Planes de Mantenimiento",
  "Organización de Infraestructura",
  "Cableado y Redes",
  "Servidores y Sistemas",
  "Mantenimiento Tecnológico",
  "Opción 1: Sistema en Comodato (Alquiler)",
  "Opción 2: Sistema Propiedad del Cliente",
  "Instalación y Configuración",
  "Modalidad Comodato (Alquiler)",
  "Instalación y Puesta en Marcha",
  "Sistemas de Extinción",
  "Planes de Monitoreo",
  "Modalidad Comodato",
]);

const ignoredLinePatterns = [
  /^SECURITY SOLUTIONS$/i,
  /^Nuestra marca es su seguridad/i,
  /^Security Solutions -/i,
  /^Su seguridad es nuestra prioridad/i,
  /^Tarifario/i,
  /^Especialistas en/i,
  /^Precios orientativos/i,
  /^orientativos según/i,
  /^Trabajamos 24\/7/i,
  /^Cobertura/i,
  /^Atención/i,
  /^Incluye equipos/i,
  /^Beneficios/i,
  /^Contacto/i,
  /^Teléfono/i,
  /^Correo/i,
  /^Garantía/i,
  /^Presupuestos válidos/i,
  /^Condiciones/i,
  /^Sistema Cuota/i,
  /^Sistema Inversión/i,
  /^Equipo \/ Servicio Precio/i,
  /^Servicio \/ Equipo Precio/i,
  /^Servicio Precio/i,
  /^Equipo Precio/i,
  /^Material Precio/i,
  /^Plan Precio/i,
  /^-- \d+ of \d+ --$/,
  /^097/,
  /@/,
  /^•/,
];

function parseMoney(value) {
  const normalized = value.replace(/\./g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(value);
}

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 34);
}

function inferService(text) {
  const found = titleByService.find(([pattern]) => pattern.test(text));
  if (found) return found[1];
  if (/alarma/i.test(text)) return "ALARM";
  if (/cctv|cámara|camara/i.test(text)) return "CCTV";
  if (/red|router|switch|wifi|rack|vlan|vpn|mikrotik|internet/i.test(text)) return "NETWORKING";
  return "OTHER";
}

function inferType(text, category) {
  if (/plan|cuota|comodato|precio mensual|mantenimiento tecnológico|planes de monitoreo/i.test(category)) {
    return "EXPENSE";
  }
  if (/instalación|configuración|programación|mantenimiento|soporte|diagnóstico|optimización|organización|etiquetado|inventario|documentación|monitoreo/i.test(text)) {
    return "LABOR";
  }
  if (/cable|canalización|alambre|postes|aisladores|cartelería|conectores|accesorios/i.test(text)) {
    return "MATERIAL";
  }
  return "EQUIPMENT";
}

function inferUnit(text, category) {
  if (/por metro/i.test(text)) return "metro";
  if (/mensual|\/mes|cuota|plan|comodato/i.test(`${text} ${category}`)) return "mes";
  return "unidad";
}

function shouldIgnoreLine(line) {
  return !line || ignoredLinePatterns.some((pattern) => pattern.test(line));
}

function parsePriceLine(line) {
  const rangeMatch = line.match(/^(.*?)\s+\$([\d.]+)\s*(?:–|-)\s*\$?([\d.]+)(.*)$/);
  if (rangeMatch) {
    const min = parseMoney(rangeMatch[2]);
    const max = parseMoney(rangeMatch[3]);
    return {
      name: rangeMatch[1].replace(/:$/, "").trim(),
      min,
      max,
      suffix: rangeMatch[4]?.trim() ?? "",
    };
  }

  const singleMatch = line.match(/^(.*?)\s+\$([\d.]+)(.*)$/);
  if (singleMatch) {
    const min = parseMoney(singleMatch[2]);
    return {
      name: singleMatch[1].replace(/:$/, "").trim(),
      min,
      max: min,
      suffix: singleMatch[3]?.trim() ?? "",
    };
  }

  const consultMatch = line.match(/^(.*?)\s+Consultar$/i);
  if (consultMatch) {
    return {
      name: consultMatch[1].replace(/:$/, "").trim(),
      min: 0,
      max: 0,
      suffix: "Consultar",
    };
  }

  return null;
}

function normalizeName(name, category) {
  const generic = /^(residencial|comercial|empresarial|industrial|pyme|corporativo|básico|basico|profesional)$/i;
  return generic.test(name) ? `${category} - ${name}` : name;
}

const text = await fs.readFile(sourcePath, "utf8");
let currentTitle = "Catálogo Security Solutions 2026";
let currentCategory = "General";
const items = [];

for (const rawLine of text.split(/\r?\n/)) {
  const line = rawLine.trim().replace(/\s+/g, " ");
  if (!line) continue;

  if (/^Tarifario|^Organización y Mantenimiento|^Modalidades de/i.test(line)) {
    currentTitle = line.replace(/^Tarifario\s*/i, "Tarifario ").trim();
    currentCategory = "General";
    continue;
  }

  if (sectionHeadings.has(line)) {
    currentCategory = line;
    continue;
  }

  if (shouldIgnoreLine(line)) {
    continue;
  }

  const parsed = parsePriceLine(line);
  if (!parsed || !parsed.name) {
    continue;
  }

  const service = inferService(`${currentTitle} ${currentCategory} ${parsed.name}`);
  const unit = inferUnit(`${parsed.name} ${parsed.suffix}`, currentCategory);
  const salePrice = parsed.max > parsed.min ? Math.round((parsed.min + parsed.max) / 2) : parsed.min;
  const itemName = normalizeName(parsed.name, currentCategory);
  const code = `SSCAT-${String(items.length + 1).padStart(3, "0")}-${slug(itemName)}`;

  items.push({
    code,
    name: itemName,
    type: inferType(itemName, currentCategory),
    category: currentCategory,
    service,
    description: [
      "Importado del Catálogo Completo Security Solutions Tarifarios PDF.",
      `Sección: ${currentTitle}.`,
      parsed.max > parsed.min
        ? `Rango orientativo original: ${formatMoney(parsed.min)} - ${formatMoney(parsed.max)}.`
        : parsed.min > 0
          ? `Precio original: ${formatMoney(parsed.min)}.`
          : "Precio original: Consultar.",
      parsed.suffix ? `Nota: ${parsed.suffix}.` : "",
      "Precio venta cargado como promedio del rango para presupuestación inicial.",
    ]
      .filter(Boolean)
      .join(" "),
    unit,
    costPrice: 0,
    salePrice,
    taxRate: TAX_RATE,
    currency: "UYU",
    active: true,
  });
}

let upserted = 0;
for (const item of items) {
  await prisma.priceBookItem.upsert({
    where: { code: item.code },
    create: item,
    update: item,
  });
  upserted += 1;
}

console.log(JSON.stringify({ sourcePath, parsedItems: items.length, upserted }, null, 2));
await prisma.$disconnect();
