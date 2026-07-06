import { PrismaService } from "../prisma/prisma.service";
import { GmailService } from "../gmail/gmail.service";
import { InventoryService } from "../inventory/inventory.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
export declare class DashboardService {
    private readonly prisma;
    private readonly gmailService;
    private readonly inventoryService;
    private readonly whatsAppService;
    constructor(prisma: PrismaService, gmailService: GmailService, inventoryService: InventoryService, whatsAppService: WhatsAppService);
    summary(): Promise<{
        lastUpdatedAt: string;
        totalCustomers: number;
        activeCustomers: number;
        prospectCustomers: number;
        inactiveCustomers: number;
        totalSites: number;
        totalWorkOrders: number;
        scheduledJobs: number;
        inProgressJobs: number;
        waitingJobs: number;
        completedJobs: number;
        totalQuotes: number;
        pendingQuotes: number;
        acceptedQuotes: number;
        quotePipeline: number;
        totalPayments: number;
        pendingPayments: number;
        overduePayments: number;
        pendingPaymentAmount: number;
        installedDevices: number;
        installedDevicesThisMonth: number;
        totalVehicles: number;
        activeVehicles: number;
        inactiveVehicles: number;
        inventory: {
            totalItems: number;
            lowStock: number;
            outOfStock: number;
            movements: number;
            installed: number;
            availableStock: number;
        };
        integrations: {
            gmail: {
                provider: string;
                connected: boolean;
                lastSyncAt: string | null;
                unread: number;
                pendingReplies: number;
                important: number;
                activeChats: number;
            };
            whatsApp: {
                provider: string;
                connected: boolean;
                lastSyncAt: string | null;
                unread: number;
                pendingReplies: number;
                important: number;
                activeChats: number;
            };
        };
        monitoringItems: {
            label: string;
            value: number;
            detail: string;
        }[];
    }>;
    private safeIntegration;
    private normalizeIntegration;
}
