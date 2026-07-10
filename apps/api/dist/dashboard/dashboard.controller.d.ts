import { DashboardService } from "./dashboard.service";
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
        finance: {
            exchangeRateUsdUyu: number;
            monthIncomeUyu: number;
            monthExpensesUyu: number;
            monthProfitUyu: number;
            monthIncomeUsd: number;
            monthExpensesUsd: number;
            monthProfitUsd: number;
        };
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
}
