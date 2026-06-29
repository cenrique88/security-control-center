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
  lastUpdatedAt?: string;
  totalCustomers?: number;
  activeCustomers: number;
  prospectCustomers?: number;
  inactiveCustomers?: number;
  totalSites?: number;
  totalWorkOrders?: number;
  scheduledJobs: number;
  inProgressJobs?: number;
  waitingJobs?: number;
  completedJobs?: number;
  totalQuotes?: number;
  pendingQuotes?: number;
  acceptedQuotes?: number;
  quotePipeline?: number;
  totalPayments?: number;
  pendingPayments: number;
  overduePayments?: number;
  pendingPaymentAmount?: number;
  installedDevices: number;
  totalVehicles?: number;
  activeVehicles: number;
  inactiveVehicles?: number;
  inventory?: {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    movements: number;
  };
  integrations?: {
    gmail: {
      provider: string;
      connected: boolean;
      lastSyncAt?: string | null;
      unread: number;
      pendingReplies: number;
      important: number;
      activeChats: number;
    };
    whatsApp: {
      provider: string;
      connected: boolean;
      lastSyncAt?: string | null;
      unread: number;
      pendingReplies: number;
      important: number;
      activeChats: number;
    };
  };
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

export type WorkOrderStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER"
  | "COMPLETED"
  | "CANCELLED";

export type WorkOrder = {
  id: string;
  customerId: string;
  siteId?: string | null;
  title: string;
  type: DeviceType;
  status: WorkOrderStatus;
  scheduledAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
  };
  site?: {
    id: string;
    name: string;
    address: string;
  } | null;
};

export type WorkOrderPayload = {
  customerId: string;
  siteId?: string;
  title: string;
  type: DeviceType;
  status?: WorkOrderStatus;
  scheduledAt?: string;
  completedAt?: string;
  notes?: string;
};

export type Quote = {
  id: string;
  customerId: string;
  number: string;
  title: string;
  laborPoints: number;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
};

export type QuotePayload = {
  customerId: string;
  number?: string;
  title: string;
  laborPoints?: number;
  subtotal: number;
  tax?: number;
};

export type Payment = {
  id: string;
  customerId: string;
  concept: string;
  amount: string | number;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
};

export type PaymentPayload = {
  customerId: string;
  concept: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
};

export type Vehicle = {
  id: string;
  name: string;
  plate?: string | null;
  traccarDeviceId?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VehiclePayload = {
  name: string;
  plate?: string;
  traccarDeviceId?: string;
  active?: boolean;
};

export type InventoryMovementType = "IN" | "OUT" | "ADJUST";

export type InventoryMovement = {
  id: string;
  itemId: string;
  type: InventoryMovementType;
  quantity: number;
  stockAfter: number;
  reason?: string | null;
  workOrderId?: string | null;
  installedDeviceId?: string | null;
  createdAt: string;
  workOrder?: {
    id: string;
    title: string;
    customer: {
      id: string;
      name: string;
    };
  } | null;
  installedDevice?: {
    id: string;
    brand?: string | null;
    model?: string | null;
    serial?: string | null;
  } | null;
};

export type InventoryItem = {
  id: string;
  sku?: string | null;
  name: string;
  category?: DeviceType | null;
  unit: string;
  stock: number;
  minStock: number;
  location?: string | null;
  supplier?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  movements: InventoryMovement[];
};

export type InventoryItemPayload = {
  sku?: string;
  name: string;
  category?: DeviceType | "";
  unit?: string;
  stock?: number;
  minStock?: number;
  location?: string;
  supplier?: string;
  notes?: string;
};

export type InventoryMovementPayload = {
  itemId: string;
  type: InventoryMovementType;
  quantity: number;
  reason?: string;
  workOrderId?: string;
  installedDeviceId?: string;
};

export type GmailStatus = {
  provider: string;
  connected: boolean;
  lastSyncAt?: string | null;
  unread: number;
  important: number;
  pendingReplies: number;
  checks: Array<{
    key: string;
    label: string;
    configured: boolean;
  }>;
};

export type GmailMessage = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
  important: boolean;
};

export type GmailSync = {
  provider: string;
  connected: boolean;
  lastSyncAt: string;
  emailAddress: string;
  unread: number;
  important: number;
  pendingReplies: number;
  messagesTotal: number;
  threadsTotal: number;
  messages: GmailMessage[];
};

export type WhatsAppStatus = {
  provider: string;
  connected: boolean;
  lastSyncAt?: string | null;
  unread: number;
  pendingReplies: number;
  activeChats: number;
  checks: Array<{
    key: string;
    label: string;
    configured: boolean;
  }>;
};

export type WhatsAppChat = {
  id: string;
  name?: string;
  isGroup?: boolean;
  unreadCount?: number;
  timestamp?: number;
  lastMessage?: string;
};

export type WhatsAppSync = {
  provider: string;
  connected: boolean;
  lastSyncAt: string;
  unread: number;
  pendingReplies: number;
  activeChats: number;
  session?: {
    id: string;
    name: string;
    status?: string;
    phone?: string;
    pushName?: string;
    connectedAt?: string | null;
    lastActive?: string | null;
  };
  stats?: Record<string, unknown>;
  chats: WhatsAppChat[];
  groups: WhatsAppChat[];
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
