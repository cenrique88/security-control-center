import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GmailService } from "../gmail/gmail.service";
import { InventoryService } from "../inventory/inventory.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gmailService: GmailService,
    private readonly inventoryService: InventoryService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  async summary() {
    const [
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
      quoteTotals,
      totalPayments,
      pendingPayments,
      overduePayments,
      pendingPaymentTotals,
      installedDevices,
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      inventory,
      gmail,
      whatsApp,
    ] = await Promise.all([
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
      this.prisma.payment.count({ where: { paidAt: null } }),
      this.prisma.payment.count({
        where: {
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
          paidAt: null,
        },
      }),
      this.prisma.installedDevice.count(),
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
      installedDevices,
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
        { label: "Cobros pendientes", value: pendingPayments, detail: `${overduePayments} vencidos` },
        { label: "Monto a cobrar", value: pendingPaymentAmount, detail: "Suma de cobros sin pagar" },
        { label: "Equipos instalados", value: installedDevices, detail: "Dispositivos cargados en sitios" },
        { label: "Vehiculos activos", value: activeVehicles, detail: `${inactiveVehicles} inactivos` },
        { label: "Articulos en almacen", value: inventory.totalItems, detail: `${inventory.lowStock} con stock bajo` },
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

  private async safeIntegration<T extends Record<string, unknown>>(callback: () => Promise<T>) {
    try {
      return {
        connected: true,
        data: await callback(),
      };
    } catch {
      return {
        connected: false,
        data: null,
      };
    }
  }

  private normalizeIntegration(
    result: { connected: boolean; data: Record<string, unknown> | null },
    fallback: {
      provider: string;
      unread: number;
      pendingReplies: number;
      important: number;
      activeChats: number;
    },
  ) {
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
}
