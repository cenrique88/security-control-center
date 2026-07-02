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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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
  installedDevicesThisMonth?: number;
  totalVehicles?: number;
  activeVehicles: number;
  inactiveVehicles?: number;
  inventory?: {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    movements: number;
    installed?: number;
    availableStock?: number;
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
export type CustomerType = "NORMAL" | "THIRD_PARTY";

export type Customer = {
  id: string;
  reference: string;
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  type: CustomerType;
  status: CustomerStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sites: number;
    workOrders: number;
    quotes: number;
    payments: number;
    meetings: number;
  };
};

export type CustomerPayload = {
  name: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  type?: CustomerType;
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
  | "CABLING"
  | "GPS"
  | "ELECTRIC_FENCE"
  | "AUTOMATION"
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
  inventoryMovements?: Array<{
    id: string;
    workOrderId?: string | null;
    createdAt: string;
    workOrder?: {
      id: string;
      title: string;
      status: WorkOrderStatus;
      scheduledAt?: string | null;
      completedAt?: string | null;
    } | null;
  }>;
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
    reference?: string | null;
    taxId?: string | null;
    logoUrl?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  site?: {
    id: string;
    name: string;
    address: string;
  } | null;
  inventoryMovements?: InventoryMovement[];
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

export type CustomerDocument = {
  id: string;
  customerId?: string;
  name: string;
  mimeType?: string | null;
  type?: string | null;
  size?: number | null;
  dataUrl?: string | null;
  url?: string | null;
  createdAt: string;
};

export type CustomerDocumentPayload = {
  name: string;
  mimeType?: string;
  size?: number;
  dataUrl: string;
};

export type CustomerProfile = {
  customer: Customer;
  sites: CustomerSite[];
  workOrders: WorkOrder[];
  equipment: InstalledDevice[];
  meetings: Meeting[];
  quotes?: Quote[];
  payments?: Payment[];
  documents: CustomerDocument[];
};

export type MeetingType = "IN_PERSON" | "VIDEO_CALL" | "PHONE";

export type MeetingStatus = "PENDING" | "DONE" | "CANCELLED";

export type MeetingAttachment = {
  id: string;
  meetingId?: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  dataUrl?: string | null;
  createdAt: string;
};

export type Meeting = {
  id: string;
  customerId: string;
  dateTime: string;
  contact?: string | null;
  type: MeetingType;
  status: MeetingStatus;
  objective: string;
  notes?: string | null;
  commitments?: string | null;
  nextStep?: string | null;
  followUpDate?: string | null;
  attendees?: string | null;
  needs?: string | null;
  equipmentNeeded?: string | null;
  estimatedBudget?: string | number | null;
  closeProbability?: number | null;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  reminderSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    reference?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  attachments: MeetingAttachment[];
};

export type MeetingPayload = {
  customerId: string;
  dateTime: string;
  contact?: string;
  type: MeetingType;
  status?: MeetingStatus;
  objective: string;
  notes?: string;
  commitments?: string;
  nextStep?: string;
  followUpDate?: string;
  attendees?: string;
  needs?: string;
  equipmentNeeded?: string;
  estimatedBudget?: number;
  closeProbability?: number;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  attachments?: Array<{
    name: string;
    mimeType?: string;
    size?: number;
    dataUrl: string;
  }>;
};

export type Quote = {
  id: string;
  customerId: string;
  meetingId?: string | null;
  number: string;
  title: string;
  service: DeviceType;
  status: QuoteStatus;
  currency: string;
  issueDate: string;
  validUntil?: string | null;
  taxIncluded: boolean;
  discountPercent: string | number;
  profitMarginPercent: string | number;
  laborPoints: string | number;
  materialsSubtotal: string | number;
  laborSubtotal: string | number;
  expensesSubtotal: string | number;
  subtotal: string | number;
  discountAmount: string | number;
  taxableBase: string | number;
  tax: string | number;
  total: string | number;
  costTotal: string | number;
  estimatedProfit: string | number;
  estimatedMargin: string | number;
  internalNotes?: string | null;
  commercialTerms?: string | null;
  executionTime?: string | null;
  warranty?: string | null;
  paymentTerms?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  items?: QuoteItem[];
  history?: QuoteHistory[];
};

export type QuoteStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";

export type QuoteItemType = "EQUIPMENT" | "MATERIAL" | "SUPPLY" | "LABOR" | "EXPENSE";

export type QuoteItem = {
  id?: string;
  quoteId?: string;
  priceBookItemId?: string | null;
  type: QuoteItemType;
  category: string;
  description: string;
  quantity: string | number;
  unit: string;
  unitPrice: string | number;
  taxRate?: string | number;
  unitCost?: string | number;
  subtotal?: string | number;
  taxAmount?: string | number;
  total?: string | number;
  sortOrder?: number;
};

export type QuoteHistory = {
  id: string;
  quoteId: string;
  action: string;
  comment?: string | null;
  createdBy?: string | null;
  createdAt: string;
};

export type QuotePayload = {
  customerId: string;
  meetingId?: string;
  number?: string;
  title: string;
  service?: DeviceType;
  status?: QuoteStatus;
  currency?: string;
  issueDate?: string;
  validUntil?: string;
  taxIncluded?: boolean;
  discountPercent?: number;
  profitMarginPercent?: number;
  laborPoints?: number;
  subtotal?: number;
  tax?: number;
  internalNotes?: string;
  commercialTerms?: string;
  executionTime?: string;
  warranty?: string;
  paymentTerms?: string;
  items?: Array<Omit<QuoteItem, "id" | "quoteId" | "subtotal" | "taxAmount" | "total" | "sortOrder">>;
};

export type PriceBookItem = {
  id: string;
  code: string;
  name: string;
  type: QuoteItemType;
  category: string;
  service?: DeviceType | null;
  brand?: string | null;
  model?: string | null;
  description?: string | null;
  unit: string;
  costPrice: string | number;
  salePrice: string | number;
  taxRate: string | number;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PriceBookItemPayload = {
  code: string;
  name: string;
  type?: QuoteItemType;
  category: string;
  service?: DeviceType | "";
  brand?: string;
  model?: string;
  description?: string;
  unit?: string;
  costPrice?: number;
  salePrice?: number;
  taxRate?: number;
  currency?: string;
  active?: boolean;
};

export type LaborPointRate = {
  id: string;
  code: string;
  name: string;
  pointValue: string | number;
  taxRate: string | number;
  currency: string;
  active: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LaborPointCalculation = {
  points: number;
  rateId: string;
  rateName: string;
  source: "CUSTOMER" | "DEFAULT";
  customerId?: string;
  pointValue: string | number;
  taxRate: string | number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
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
  item?: {
    id: string;
    sku?: string | null;
    name: string;
    unit: string;
  } | null;
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
    ipAddress?: string | null;
  } | null;
};

export type InventoryItem = {
  id: string;
  reference: string;
  sku?: string | null;
  name: string;
  category?: DeviceType | null;
  unit: string;
  stock: number;
  installedQuantity?: number;
  minStock: number;
  managedStock: boolean;
  location?: string | null;
  supplier?: string | null;
  supplierCategory?: string | null;
  costPrice?: string | number | null;
  taxAmount?: string | number | null;
  priceWithTax?: string | number | null;
  currency?: string | null;
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
  managedStock?: boolean;
  location?: string;
  supplier?: string;
  supplierCategory?: string;
  costPrice?: number;
  taxAmount?: number;
  priceWithTax?: number;
  currency?: string;
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
  connectionError?: string;
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

export type WhatsAppDailyMeetingSummary = {
  settings: {
    id: string;
    enabled: boolean;
    recipientName?: string | null;
    recipientPhone: string;
    sendTime: string;
    messageTemplate: string;
    lastSentForDate?: string | null;
    lastSentAt?: string | null;
    updatedAt: string;
    createdAt: string;
  };
  preview: {
    dateKey: string;
    dateLabel: string;
    meetingsCount: number;
    message: string;
  };
  sent?: boolean;
};

export type WhatsAppDailyMeetingSummaryPayload = {
  enabled?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  sendTime?: string;
  messageTemplate?: string;
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
    const message = await readErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  const fallback = `Request failed (${response.status})`;
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const data = JSON.parse(text) as { message?: string | string[]; error?: string };
    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message || data.error || text;
  } catch {
    return text;
  }
}
