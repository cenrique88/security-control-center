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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const gmail_service_1 = require("../gmail/gmail.service");
const inventory_service_1 = require("../inventory/inventory.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let DashboardService = class DashboardService {
    prisma;
    gmailService;
    inventoryService;
    whatsAppService;
    constructor(prisma, gmailService, inventoryService, whatsAppService) {
        this.prisma = prisma;
        this.gmailService = gmailService;
        this.inventoryService = inventoryService;
        this.whatsAppService = whatsAppService;
    }
    async summary() {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const nextMonthStart = new Date(monthStart);
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
        const [totalCustomers, activeCustomers, prospectCustomers, inactiveCustomers, totalSites, totalWorkOrders, scheduledJobs, inProgressJobs, waitingJobs, completedJobs, totalQuotes, pendingQuotes, acceptedQuotes, quoteTotals, totalPayments, pendingPayments, overduePayments, pendingPaymentTotals, installedDevices, installedDevicesThisMonth, totalVehicles, activeVehicles, inactiveVehicles, inventory, gmail, whatsApp,] = await Promise.all([
            this.prisma.customer.count(),
            this.prisma.customer.count({ where: { status: "ACTIVE" } }),
            this.prisma.customer.count({ where: { status: "PROSPECT" } }),
            this.prisma.customer.count({ where: { status: "INACTIVE" } }),
            this.prisma.site.count(),
            this.prisma.workOrder.count(),
            this.prisma.workOrder.count({ where: { status: "SCHEDULED" } }),
            this.prisma.workOrder.count({ where: { status: "IN_PROGRESS" } }),
            this.prisma.workOrder.count({ where: { status: "WAITING_CUSTOMER" } }),
            this.prisma.workOrder.count({ where: { status: "COMPLETED" } }),
            this.prisma.quote.count(),
            this.prisma.quote.count({ where: { acceptedAt: null } }),
            this.prisma.quote.count({ where: { acceptedAt: { not: null } } }),
            this.prisma.quote.aggregate({
                _sum: {
                    total: true,
                },
                where: {
                    acceptedAt: null,
                },
            }),
            this.prisma.payment.count(),
            this.prisma.payment.count({ where: { transactionType: "INCOME", paidAt: null } }),
            this.prisma.payment.count({
                where: {
                    transactionType: "INCOME",
                    paidAt: null,
                    dueDate: {
                        lt: new Date(),
                    },
                },
            }),
            this.prisma.payment.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    transactionType: "INCOME",
                    paidAt: null,
                },
            }),
            this.prisma.inventoryMovement.aggregate({
                where: {
                    type: "OUT",
                    installedDeviceId: { not: null },
                },
                _sum: {
                    quantity: true,
                },
            }),
            this.prisma.inventoryMovement.aggregate({
                where: {
                    type: "OUT",
                    installedDeviceId: { not: null },
                    createdAt: { gte: monthStart, lt: nextMonthStart },
                },
                _sum: {
                    quantity: true,
                },
            }),
            this.prisma.vehicle.count(),
            this.prisma.vehicle.count({ where: { active: true } }),
            this.prisma.vehicle.count({ where: { active: false } }),
            this.inventoryService.summary(),
            this.safeIntegration(() => this.gmailService.sync()),
            this.safeIntegration(() => this.whatsAppService.sync()),
        ]);
        const gmailSummary = this.normalizeIntegration(gmail, {
            provider: "Gmail",
            unread: 0,
            pendingReplies: 0,
            important: 0,
            activeChats: 0,
        });
        const whatsAppSummary = this.normalizeIntegration(whatsApp, {
            provider: "OpenWA",
            unread: 0,
            pendingReplies: 0,
            important: 0,
            activeChats: 0,
        });
        const installedDevicesTotal = installedDevices._sum.quantity ?? 0;
        const installedDevicesThisMonthTotal = installedDevicesThisMonth._sum.quantity ?? 0;
        const quotePipeline = Number(quoteTotals._sum.total ?? 0);
        const pendingPaymentAmount = Number(pendingPaymentTotals._sum.amount ?? 0);
        return {
            lastUpdatedAt: new Date().toISOString(),
            totalCustomers,
            activeCustomers,
            prospectCustomers,
            inactiveCustomers,
            totalSites,
            totalWorkOrders,
            scheduledJobs,
            inProgressJobs,
            waitingJobs,
            completedJobs,
            totalQuotes,
            pendingQuotes,
            acceptedQuotes,
            quotePipeline,
            totalPayments,
            pendingPayments,
            overduePayments,
            pendingPaymentAmount,
            installedDevices: installedDevicesTotal,
            installedDevicesThisMonth: installedDevicesThisMonthTotal,
            totalVehicles,
            activeVehicles,
            inactiveVehicles,
            inventory,
            integrations: {
                gmail: gmailSummary,
                whatsApp: whatsAppSummary,
            },
            monitoringItems: [
                { label: "Clientes activos", value: activeCustomers, detail: `${prospectCustomers} prospectos en seguimiento` },
                { label: "Sitios registrados", value: totalSites, detail: "Direcciones y ubicaciones operativas" },
                { label: "Trabajos programados", value: scheduledJobs, detail: `${inProgressJobs} en curso, ${waitingJobs} en espera` },
                { label: "Trabajos completados", value: completedJobs, detail: `${totalWorkOrders} ordenes totales` },
                { label: "Presupuestos pendientes", value: pendingQuotes, detail: `${acceptedQuotes} aceptados` },
                { label: "Pipeline presupuestado", value: quotePipeline, detail: "Importe pendiente de aprobacion" },
                { label: "Ingresos pendientes", value: pendingPayments, detail: `${overduePayments} vencidos` },
                { label: "Monto a cobrar", value: pendingPaymentAmount, detail: "Suma de ingresos sin aplicar" },
                { label: "Equipos por mes", value: installedDevicesThisMonthTotal, detail: `${installedDevicesTotal} equipos instalados en total` },
                { label: "Vehiculos activos", value: activeVehicles, detail: `${inactiveVehicles} inactivos` },
                { label: "Stock disponible", value: inventory.availableStock, detail: `${inventory.installed} unidades instaladas desde almacen` },
                { label: "Articulos en almacen", value: inventory.totalItems, detail: `${inventory.outOfStock} sin stock` },
                { label: "Sin stock", value: inventory.outOfStock, detail: "Articulos que necesitan reposicion" },
                {
                    label: "Gmail no leidos",
                    value: gmailSummary.unread,
                    detail: gmailSummary.connected
                        ? `${gmailSummary.pendingReplies} pendientes en bandeja`
                        : "Gmail sin conexion",
                },
                {
                    label: "WhatsApp activos",
                    value: whatsAppSummary.activeChats,
                    detail: whatsAppSummary.connected ? `${whatsAppSummary.unread} mensajes no leidos` : "WhatsApp sin conexion",
                },
            ],
        };
    }
    async safeIntegration(callback) {
        try {
            return {
                connected: true,
                data: await callback(),
            };
        }
        catch {
            return {
                connected: false,
                data: null,
            };
        }
    }
    normalizeIntegration(result, fallback) {
        return {
            provider: String(result.data?.provider ?? fallback.provider),
            connected: result.connected && Boolean(result.data?.connected ?? true),
            lastSyncAt: typeof result.data?.lastSyncAt === "string" ? result.data.lastSyncAt : null,
            unread: Number(result.data?.unread ?? fallback.unread),
            pendingReplies: Number(result.data?.pendingReplies ?? fallback.pendingReplies),
            important: Number(result.data?.important ?? fallback.important),
            activeChats: Number(result.data?.activeChats ?? fallback.activeChats),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gmail_service_1.GmailService,
        inventory_service_1.InventoryService,
        whatsapp_service_1.WhatsAppService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map