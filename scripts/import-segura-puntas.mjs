import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const POINT_VALUE = 770;
const TAX_RATE = 22;

const items = [
  ["pir interior", 1],
  ["magneticos", 1],
  ["Sirena Interior", 1],
  ["Sirena Exterior", 1.2],
  ["Sensor Exterior", 1.2],
  ["Barreras", 2.4],
  ["instalacion de Barrera (cableado de los 2 elementos", 2],
  ["central ( trafo, tamper,bateria )", 2],
  ["teclado", 1],
  ["Expansor", 1],
  ["Reconexion", 1.2],
  ["Camaras ( Balun )", 1.5],
  ["DVR ( con disco duro Incluido )", 3],
  ["Fuente", 1],
  ["Router", 1],
  ["Service", 1],
  ["GPRS", 0.5],
  ["Sensores Inalambricos", 0.5],
  ["Magnetico Inalambricos", 0.5],
  ["Cableado cada 30 mts", 1],
  ["Receptor Inalambrico", 1],
  ["TAG", 0.25],
  ["Control Remoto", 0.5],
  ["Pantalla Adicional", 1.5],
  ["Megafono", 1.2],
  ["Gateway, Cada Gateway puede llevar 1 o 2 megafonos", 1],
  ["Patchera", 1],
  ["Rack", 2],
  ["Timbre Hik + Pantalla, incluye Switch y/o inyector POE", 4],
];

function slug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
}

function inferService(name) {
  if (/camara|camaras|dvr|balun/i.test(name)) return "CCTV";
  if (/router|patchera|rack|timbre|gateway|megafono/i.test(name)) return "NETWORKING";
  if (/tag|control remoto/i.test(name)) return "ACCESS_CONTROL";
  return "ALARM";
}

const segura = await prisma.customer.findFirst({
  where: {
    type: "THIRD_PARTY",
    name: { contains: "Segura", mode: "insensitive" },
  },
  orderBy: { updatedAt: "desc" },
});

if (segura) {
  const currentRate = await prisma.customerLaborPointRate.findFirst({
    where: { customerId: segura.id, name: "Punta Segura 2026" },
  });

  const data = {
    customerId: segura.id,
    name: "Punta Segura 2026",
    pointValue: POINT_VALUE,
    taxRate: TAX_RATE,
    currency: "UYU",
    active: true,
    notes: "Tarifa importada de Puntas.pdf: costo por boca/punta $770 + IVA, vigencia 01/01/2026.",
  };

  if (currentRate) {
    await prisma.customerLaborPointRate.update({ where: { id: currentRate.id }, data });
  } else {
    await prisma.customerLaborPointRate.create({ data });
  }
}

let upserted = 0;
for (const [name, points] of items) {
  const code = `SEGURA-PUNTAS-${slug(name)}`;
  await prisma.priceBookItem.upsert({
    where: { code },
    create: {
      code,
      name,
      type: "LABOR",
      category: "Puntas Segura",
      service: inferService(name),
      description: `Tarifario Segura Satelital Puntas.pdf. Equivalencia: ${points} punta${points === 1 ? "" : "s"}.`,
      unit: "servicio",
      costPrice: points * POINT_VALUE,
      salePrice: points * POINT_VALUE,
      taxRate: TAX_RATE,
      currency: "UYU",
      active: true,
    },
    update: {
      name,
      type: "LABOR",
      category: "Puntas Segura",
      service: inferService(name),
      description: `Tarifario Segura Satelital Puntas.pdf. Equivalencia: ${points} punta${points === 1 ? "" : "s"}.`,
      unit: "servicio",
      costPrice: points * POINT_VALUE,
      salePrice: points * POINT_VALUE,
      taxRate: TAX_RATE,
      currency: "UYU",
      active: true,
    },
  });
  upserted += 1;
}

console.log(JSON.stringify({ seguraCustomerId: segura?.id ?? null, pointValue: POINT_VALUE, importedItems: upserted }, null, 2));
await prisma.$disconnect();
