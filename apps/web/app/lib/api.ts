export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type DashboardSummary = {
  activeCustomers: number;
  scheduledJobs: number;
  pendingPayments: number;
  installedDevices: number;
  activeVehicles: number;
  monitoringItems: Array<{
    label: string;
    value: number | string;
    detail?: string;
  }>;
};

export type CustomerStatus = "ACTIVE" | "PROSPECT" | "INACTIVE";

export type Customer = {
  id: string;
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: CustomerStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sites: number;
    workOrders: number;
    quotes: number;
    payments: number;
  };
};

export type CustomerPayload = {
  name: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: CustomerStatus;
  notes?: string;
};

export type CustomerSite = {
  id: string;
  customerId: string;
  name: string;
  address: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    equipment: number;
    workOrders: number;
  };
};

export type SitePayload = {
  name: string;
  address: string;
  notes?: string;
};

export type DeviceType =
  | "CCTV"
  | "ALARM"
  | "ACCESS_CONTROL"
  | "GPS"
  | "NETWORKING"
  | "MAINTENANCE"
  | "OTHER";

export type InstalledDevice = {
  id: string;
  siteId: string;
  type: DeviceType;
  brand?: string | null;
  model?: string | null;
  serial?: string | null;
  ipAddress?: string | null;
  installedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  site: {
    id: string;
    name: string;
    address: string;
    customer: {
      id: string;
      name: string;
    };
  };
};

export type DevicePayload = {
  siteId: string;
  type: DeviceType;
  brand?: string;
  model?: string;
  serial?: string;
  ipAddress?: string;
  installedAt?: string;
  notes?: string;
};

function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  if (typeof window !== "undefined" && window.location.hostname.endsWith(".devtunnels.ms")) {
    return "";
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    configuredUrl.includes("localhost")
  ) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  return configuredUrl;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}
