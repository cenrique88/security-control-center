import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      activeCustomers,
      scheduledJobs,
      pendingPayments,
      installedDevices,
      activeVehicles,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { status: "ACTIVE" } }),
      this.prisma.workOrder.count({ where: { status: "SCHEDULED" } }),
      this.prisma.payment.count({ where: { paidAt: null } }),
      this.prisma.installedDevice.count(),
      this.prisma.vehicle.count({ where: { active: true } }),
    ]);

    return {
      activeCustomers,
      scheduledJobs,
      pendingPayments,
      installedDevices,
      activeVehicles,
      monitoringItems: [
        { label: "Trabajos programados", value: scheduledJobs },
        { label: "Cobros pendientes", value: pendingPayments },
        { label: "Vehiculos activos", value: activeVehicles },
      ],
    };
  }
}
