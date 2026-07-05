"use client";

import {
  Bell,
  CalendarDays,
  Car,
  Handshake,
  ClipboardList,
  Copy,
  DollarSign,
  Edit3,
  FileText,
  Fuel,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Paperclip,
  PhoneCall,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Users,
  Video,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ChangeEvent, CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  apiRequest,
  AuthUser,
  Customer,
  CustomerDocument,
  CustomerDocumentPayload,
  CustomerProfile,
  CustomerPayload,
  CustomerSite,
  CustomerStatus,
  CustomerType,
  DashboardSummary,
  DevicePayload,
  DeviceType,
  GmailSync,
  GmailStatus,
  InventoryItem,
  InventoryMovement,
  InventoryItemPayload,
  InventoryMovementPayload,
  InventoryMovementType,
  InstalledDevice,
  LaborPointCalculation,
  Meeting,
  MeetingPayload,
  MeetingStatus,
  MeetingType,
  Payment,
  PaymentPayload,
  PriceBookItem,
  Quote,
  QuotePayload,
  QuoteItemType,
  QuotePricingMode,
  QuoteStatus,
  SitePayload,
  TraccarGeofenceSync,
  TraccarSettings,
  Vehicle,
  VehicleDailySummary,
  VehiclePayload,
  WhatsAppChat,
  WhatsAppDailyMeetingSummary,
  WhatsAppDailyMeetingSummaryPayload,
  WhatsAppSync,
  WhatsAppStatus,
  WorkOrder,
  WorkOrderPayload,
  WorkOrderReportPhoto,
  WorkOrderStatus,
} from "./lib/api";

const modules = [
  { name: "Dashboard", icon: ShieldCheck },
  { name: "Clientes", icon: Users },
  { name: "Tercerizados", icon: Handshake },
  { name: "Trabajos", icon: Wrench },
  { name: "Agenda", icon: CalendarDays },
  { name: "Despachador", icon: MapPin },
  { name: "Reuniones", icon: PhoneCall },
  { name: "Presupuestos", icon: ClipboardList },
  { name: "Cobros", icon: DollarSign },
  { name: "Almacen", icon: Package },
  { name: "Equipos", icon: Video },
  { name: "Vehiculos", icon: Car },
  { name: "Gmail", icon: Mail },
  { name: "WhatsApp", icon: MessageSquare },
];

const statusLabels: Record<CustomerStatus, string> = {
  ACTIVE: "Activo",
  PROSPECT: "Prospecto",
  INACTIVE: "Inactivo",
};

const deviceTypeLabels: Record<DeviceType, string> = {
  CCTV: "CCTV",
  ALARM: "Alarma",
  ACCESS_CONTROL: "Control de acceso",
  CABLING: "Cableado",
  GPS: "GPS",
  ELECTRIC_FENCE: "Cercos electricos",
  AUTOMATION: "Automatizacion",
  NETWORKING: "Redes",
  MAINTENANCE: "Mantenimiento",
  OTHER: "Otro",
};

const quoteStatusLabels: Record<QuoteStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  EXPIRED: "Vencido",
};

const workStatusLabels: Record<WorkOrderStatus, string> = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En curso",
  WAITING_CUSTOMER: "Espera cliente",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const meetingTypeLabels: Record<MeetingType, string> = {
  IN_PERSON: "Presencial",
  VIDEO_CALL: "Videollamada",
  PHONE: "Telefono",
};

const meetingStatusLabels: Record<MeetingStatus, string> = {
  PENDING: "Pendiente",
  DONE: "Aceptado",
  CANCELLED: "Cancelada",
};

type AppNotification = {
  id: string;
  title: string;
  detail: string;
  module: string;
  severity: "info" | "warning" | "critical";
  value: number | string;
};

type MessageComposeState = {
  channel: "whatsapp" | "mail";
  title: string;
  to: string;
  subject: string;
  message: string;
  attachment?: {
    name: string;
    mimeType: string;
    dataUrl: string;
  };
  customerId?: string;
  workOrderId?: string;
};

type MessageRecipientOption = {
  label: string;
  value: string;
  detail?: string;
};

type InventorySortKey = "reference" | "date" | "brand" | "model" | "installed" | "status";
type InventoryColumnKey = InventorySortKey | "actions";

type QuoteCatalogOption = {
  id: string;
  code: string;
  name: string;
  type: QuoteItemType;
  category: string;
  description?: string | null;
  unit: string;
  unitPrice: number;
  unitCost: number;
  taxRate: number;
  currency?: string | null;
  source: "INVENTORY" | "PRICE_BOOK";
};

const inventoryColumnDefaults: Record<InventoryColumnKey, number> = {
  reference: 124,
  date: 124,
  brand: 180,
  model: 620,
  installed: 136,
  status: 150,
  actions: 116,
};

const inventoryColumnMinimums: Record<InventoryColumnKey, number> = {
  reference: 92,
  date: 92,
  brand: 130,
  model: 260,
  installed: 108,
  status: 118,
  actions: 92,
};

const inventoryColumnOrder: InventoryColumnKey[] = ["reference", "date", "brand", "model", "installed", "status", "actions"];
const inventorySortableColumns: Array<{ key: InventorySortKey; label: string }> = [
  { key: "reference", label: "Ref." },
  { key: "date", label: "Fecha" },
  { key: "brand", label: "Importador" },
  { key: "model", label: "Modelo" },
  { key: "installed", label: "Instalado" },
  { key: "status", label: "Estado" },
];

const emptyCustomerForm: CustomerPayload = {
  name: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  latitude: undefined,
  longitude: undefined,
  logoUrl: "",
  type: "NORMAL",
  status: "PROSPECT",
  notes: "",
};

const emptySiteForm: SitePayload = {
  name: "",
  address: "",
  latitude: undefined,
  longitude: undefined,
  notes: "",
};

const emptyDeviceForm: DevicePayload = {
  siteId: "",
  type: "CCTV",
  brand: "",
  model: "",
  serial: "",
  ipAddress: "",
  installedAt: "",
  notes: "",
};

const emptyWorkOrderForm: WorkOrderPayload = {
  customerId: "",
  siteId: "",
  title: "",
  type: "CCTV",
  status: "SCHEDULED",
  scheduledAt: "",
  notes: "",
  reportBeforeNotes: "",
  reportAfterNotes: "",
  reportTasks: "",
  reportTests: "",
  reportRecommendations: "",
  reportPhotos: [],
};

const emptyQuoteForm: QuotePayload = {
  customerId: "",
  number: "",
  title: "",
  service: "CCTV",
  status: "DRAFT",
  pricingMode: "DIRECT",
  currency: "UYU",
  taxIncluded: true,
  discountPercent: 0,
  discountAmount: 0,
  profitMarginPercent: 0,
  laborPoints: 0,
  subtotal: 0,
  tax: 0,
  commercialTerms: "",
  executionTime: "",
  warranty: "",
  paymentTerms: "",
  internalNotes: "",
  items: [],
};

const emptyMeetingForm: MeetingPayload = {
  customerId: "",
  dateTime: "",
  contact: "",
  type: "IN_PERSON",
  status: "PENDING",
  objective: "",
  notes: "",
  commitments: "",
  nextStep: "",
  followUpDate: "",
  attendees: "",
  needs: "",
  equipmentNeeded: "",
  estimatedBudget: 0,
  closeProbability: 50,
  reminderEnabled: true,
  reminderMinutesBefore: 30,
  attachments: [],
};

const emptyPaymentForm: PaymentPayload = {
  customerId: "",
  concept: "",
  amount: 0,
  dueDate: "",
  paidAt: "",
};

const emptyVehicleForm: VehiclePayload = {
  name: "",
  plate: "",
  traccarDeviceId: "",
  fuelKmPerLiter: 10,
  active: true,
};

const emptyInventoryForm: InventoryItemPayload = {
  sku: "",
  name: "",
  category: "",
  unit: "u",
  stock: 0,
  minStock: 0,
  managedStock: true,
  location: "",
  supplier: "",
  notes: "",
};

const emptyInventoryMovementForm: InventoryMovementPayload = {
  itemId: "",
  type: "OUT",
  quantity: 1,
  reason: "",
  workOrderId: "",
  installedDeviceId: "",
};

const fallbackGmailStatus: GmailStatus = {
  provider: "Gmail",
  connected: false,
  lastSyncAt: null,
  unread: 0,
  important: 0,
  pendingReplies: 0,
  checks: [
    { key: "GMAIL_CLIENT_ID", label: "Client ID", configured: false },
    { key: "GMAIL_CLIENT_SECRET", label: "Client secret", configured: false },
    { key: "GMAIL_REDIRECT_URI", label: "Redirect URI", configured: false },
    { key: "GMAIL_REFRESH_TOKEN", label: "Refresh token", configured: false },
  ],
};

const emptyGmailSync: GmailSync = {
  provider: "Gmail",
  connected: false,
  lastSyncAt: "",
  emailAddress: "",
  unread: 0,
  important: 0,
  pendingReplies: 0,
  messagesTotal: 0,
  threadsTotal: 0,
  messages: [],
};

const fallbackWhatsAppStatus: WhatsAppStatus = {
  provider: "OpenWA",
  connected: false,
  lastSyncAt: null,
  unread: 0,
  pendingReplies: 0,
  activeChats: 0,
  checks: [
    { key: "OPENWA_API_URL", label: "OpenWA API URL", configured: false },
    { key: "OPENWA_SESSION", label: "Sesion", configured: false },
    { key: "OPENWA_API_KEY", label: "API key", configured: false },
    { key: "OPENWA_WEBHOOK_SECRET", label: "Webhook secret", configured: false },
  ],
};

const emptyWhatsAppSync: WhatsAppSync = {
  provider: "OpenWA",
  connected: false,
  lastSyncAt: "",
  unread: 0,
  pendingReplies: 0,
  activeChats: 0,
  chats: [],
  groups: [],
};

const emptyWhatsAppDailyMeetingSummary: WhatsAppDailyMeetingSummary = {
  settings: {
    id: "meeting-summary",
    enabled: true,
    recipientName: "Lewis",
    recipientPhone: "097684200",
    sendTime: "18:00",
    messageTemplate: "Resumen de reuniones para {fecha}\n\n{reuniones}\n\nSecurity Solutions",
    updatedAt: "",
    createdAt: "",
  },
  preview: {
    dateKey: "",
    dateLabel: "",
    meetingsCount: 0,
    message: "",
  },
};

const fallbackSummary: DashboardSummary = {
  lastUpdatedAt: "",
  totalCustomers: 0,
  activeCustomers: 0,
  prospectCustomers: 0,
  inactiveCustomers: 0,
  totalSites: 0,
  totalWorkOrders: 0,
  scheduledJobs: 0,
  inProgressJobs: 0,
  waitingJobs: 0,
  completedJobs: 0,
  totalQuotes: 0,
  pendingQuotes: 0,
  acceptedQuotes: 0,
  quotePipeline: 0,
  totalPayments: 0,
  pendingPayments: 0,
  overduePayments: 0,
  pendingPaymentAmount: 0,
  installedDevices: 0,
  totalVehicles: 0,
  activeVehicles: 0,
  inactiveVehicles: 0,
  inventory: {
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    movements: 0,
  },
  integrations: {
    gmail: {
      provider: "Gmail",
      connected: false,
      lastSyncAt: null,
      unread: 0,
      pendingReplies: 0,
      important: 0,
      activeChats: 0,
    },
    whatsApp: {
      provider: "OpenWA",
      connected: false,
      lastSyncAt: null,
      unread: 0,
      pendingReplies: 0,
      important: 0,
      activeChats: 0,
    },
  },
  monitoringItems: [
    { label: "Trabajos programados", value: 0, detail: "Sin conexion al backend" },
    { label: "Gmail no leidos", value: 0, detail: "Gmail pendiente de conectar" },
    { label: "WhatsApp activos", value: 0, detail: "OpenWA pendiente" },
    { label: "Vehiculos activos", value: 0, detail: "Traccar pendiente" },
    { label: "Cobros pendientes", value: 0, detail: "Sin datos cargados" },
    { label: "Alertas tecnicas", value: 0, detail: "Pendiente de integraciones" },
  ],
};

export default function Home() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<CustomerSite[]>([]);
  const [devices, setDevices] = useState<InstalledDevice[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrderStatsSource, setWorkOrderStatsSource] = useState<WorkOrder[]>([]);
  const [agendaOrders, setAgendaOrders] = useState<WorkOrder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [priceBookItems, setPriceBookItems] = useState<PriceBookItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryCatalogMatches, setInventoryCatalogMatches] = useState<InventoryItem[]>([]);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>(fallbackGmailStatus);
  const [gmailSync, setGmailSync] = useState<GmailSync>(emptyGmailSync);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus>(fallbackWhatsAppStatus);
  const [whatsAppSync, setWhatsAppSync] = useState<WhatsAppSync>(emptyWhatsAppSync);
  const [whatsAppDailySummary, setWhatsAppDailySummary] = useState<WhatsAppDailyMeetingSummary>(emptyWhatsAppDailyMeetingSummary);
  const [whatsAppDailySummaryForm, setWhatsAppDailySummaryForm] = useState<WhatsAppDailyMeetingSummaryPayload>({
    enabled: true,
    recipientName: "Lewis",
    recipientPhone: "097684200",
    sendTime: "18:00",
    messageTemplate: emptyWhatsAppDailyMeetingSummary.settings.messageTemplate,
  });
  const [customerForm, setCustomerForm] = useState<CustomerPayload>(emptyCustomerForm);
  const [siteForm, setSiteForm] = useState<SitePayload>(emptySiteForm);
  const [deviceForm, setDeviceForm] = useState<DevicePayload>(emptyDeviceForm);
  const [workOrderForm, setWorkOrderForm] = useState<WorkOrderPayload>(emptyWorkOrderForm);
  const [meetingForm, setMeetingForm] = useState<MeetingPayload>(emptyMeetingForm);
  const [quoteForm, setQuoteForm] = useState<QuotePayload>(emptyQuoteForm);
  const [quoteLaborPreview, setQuoteLaborPreview] = useState<LaborPointCalculation | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentPayload>(emptyPaymentForm);
  const [vehicleForm, setVehicleForm] = useState<VehiclePayload>(emptyVehicleForm);
  const [inventoryForm, setInventoryForm] = useState<InventoryItemPayload>(emptyInventoryForm);
  const [inventoryMovementForm, setInventoryMovementForm] =
    useState<InventoryMovementPayload>(emptyInventoryMovementForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingWorkOrderId, setEditingWorkOrderId] = useState<string | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingInventoryItemId, setEditingInventoryItemId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType | "ALL">("ALL");
  const [workSearch, setWorkSearch] = useState("");
  const [workStatus, setWorkStatus] = useState<WorkOrderStatus | "ALL">("ALL");
  const [agendaDate, setAgendaDate] = useState(() => toDateInputValue(new Date()));
  const [agendaStatus, setAgendaStatus] = useState<WorkOrderStatus | "ALL">("ALL");
  const [meetingSearch, setMeetingSearch] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType | "ALL">("ALL");
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | "ALL">("ALL");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<"ALL" | QuoteStatus>("ALL");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"ALL" | "PENDING" | "PAID" | "OVERDUE">("ALL");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState<DeviceType | "ALL">("ALL");
  const [inventorySupplier, setInventorySupplier] = useState("ALL");
  const [inventoryMode, setInventoryMode] = useState<"stock" | "catalog" | "all">("stock");
  const [inventoryStockFilter, setInventoryStockFilter] = useState<"ALL" | "LOW">("ALL");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus | "ALL">("ALL");
  const [status, setStatus] = useState("Cargando datos...");
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [workOrdersLoading, setWorkOrdersLoading] = useState(false);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [whatsAppSummarySaving, setWhatsAppSummarySaving] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [siteError, setSiteError] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [workOrderError, setWorkOrderError] = useState("");
  const [agendaError, setAgendaError] = useState("");
  const [meetingError, setMeetingError] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [gmailError, setGmailError] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [locating, setLocating] = useState(false);
  const [siteLocating, setSiteLocating] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workOrderDocument, setWorkOrderDocument] = useState<WorkOrder | null>(null);
  const [customerDocumentView, setCustomerDocumentView] = useState<{ customer: Customer; document: CustomerDocument } | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [customerProfileLoading, setCustomerProfileLoading] = useState(false);
  const [customerProfileError, setCustomerProfileError] = useState("");
  const [focusedWorkOrderId, setFocusedWorkOrderId] = useState<string | null>(null);
  const [focusedDeviceGroupKey, setFocusedDeviceGroupKey] = useState<string | null>(null);
  const [messageCompose, setMessageCompose] = useState<MessageComposeState | null>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState("");
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const locked = Boolean(
      workOrderDocument ||
      customerDocumentView ||
      messageCompose ||
      customerProfile ||
      customerProfileLoading ||
      customerProfileError,
    );
    document.body.classList.toggle("modalScrollLocked", locked);
    return () => {
      document.body.classList.remove("modalScrollLocked");
    };
  }, [workOrderDocument, customerDocumentView, messageCompose, customerProfile, customerProfileLoading, customerProfileError]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    function closeNotificationsFromOutside(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (!(target instanceof Node) || notificationsMenuRef.current?.contains(target)) {
        return;
      }

      setNotificationsOpen(false);
    }

    document.addEventListener("mousedown", closeNotificationsFromOutside);
    document.addEventListener("touchstart", closeNotificationsFromOutside);
    return () => {
      document.removeEventListener("mousedown", closeNotificationsFromOutside);
      document.removeEventListener("touchstart", closeNotificationsFromOutside);
    };
  }, [notificationsOpen]);

  const summaryCards = useMemo(
    () => [
      { label: "Clientes", value: summary.totalCustomers ?? summary.activeCustomers },
      { label: "Clientes activos", value: summary.activeCustomers },
      { label: "Trabajos programados", value: summary.scheduledJobs },
      {
        label: "Equipos por mes",
        value: summary.installedDevicesThisMonth ?? summary.installedDevices,
        detail: `${summary.installedDevices ?? 0} equipos instalados en total`,
      },
      {
        label: "Instalados desde almacen",
        value: summary.inventory?.installed ?? 0,
        detail: `${summary.inventory?.availableStock ?? 0} unidades disponibles`,
      },
      { label: "Cobros pendientes", value: summary.pendingPayments },
      { label: "Sin stock", value: summary.inventory?.outOfStock ?? 0 },
      { label: "A cobrar", value: formatCurrency(summary.pendingPaymentAmount ?? 0) },
      { label: "Gmail no leidos", value: summary.integrations?.gmail.unread ?? 0 },
      { label: "WhatsApp no leidos", value: summary.integrations?.whatsApp.unread ?? 0 },
    ],
    [summary],
  );

  const notifications = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];
    const addNotification = (notification: AppNotification, condition: boolean) => {
      if (condition) {
        items.push(notification);
      }
    };

    addNotification(
      {
        id: "inventory-low",
        title: "Sin stock",
        detail: `${summary.inventory?.outOfStock ?? 0} articulos sin stock.`,
        module: "Almacen",
        severity: "warning",
        value: summary.inventory?.outOfStock ?? 0,
      },
      Boolean(summary.inventory?.outOfStock),
    );

    addNotification(
      {
        id: "payments-overdue",
        title: "Cobros vencidos",
        detail: "Hay cobros pendientes con fecha vencida.",
        module: "Cobros",
        severity: "critical",
        value: summary.overduePayments ?? 0,
      },
      Boolean(summary.overduePayments),
    );

    addNotification(
      {
        id: "payments-pending",
        title: "Cobros pendientes",
        detail: `Monto a cobrar: ${formatCurrency(summary.pendingPaymentAmount ?? 0)}`,
        module: "Cobros",
        severity: "warning",
        value: summary.pendingPayments,
      },
      summary.pendingPayments > 0,
    );

    addNotification(
      {
        id: "work-scheduled",
        title: "Trabajos programados",
        detail: `${summary.inProgressJobs ?? 0} en curso y ${summary.waitingJobs ?? 0} en espera.`,
        module: "Trabajos",
        severity: "info",
        value: summary.scheduledJobs,
      },
      summary.scheduledJobs > 0 || Boolean(summary.inProgressJobs) || Boolean(summary.waitingJobs),
    );

    addNotification(
      {
        id: "gmail-unread",
        title: "Gmail no leidos",
        detail: "Correos pendientes en la bandeja principal.",
        module: "Gmail",
        severity: "info",
        value: summary.integrations?.gmail.unread ?? 0,
      },
      Boolean(summary.integrations?.gmail.unread),
    );

    addNotification(
      {
        id: "whatsapp-unread",
        title: "WhatsApp no leidos",
        detail: `${summary.integrations?.whatsApp.activeChats ?? 0} chats activos sincronizados.`,
        module: "WhatsApp",
        severity: "warning",
        value: summary.integrations?.whatsApp.unread ?? 0,
      },
      Boolean(summary.integrations?.whatsApp.unread),
    );

    return items;
  }, [summary]);

  const criticalNotifications = useMemo(
    () => notifications.filter((notification) => notification.severity === "critical").length,
    [notifications],
  );

  const messageRecipientOptions = useMemo<MessageRecipientOption[]>(() => {
    if (!messageCompose) {
      return [];
    }

    const options: MessageRecipientOption[] = [];
    const seen = new Set<string>();
    const addOption = (option: MessageRecipientOption) => {
      const value = option.value.trim();
      if (!value || seen.has(value)) {
        return;
      }

      seen.add(value);
      options.push({ ...option, value });
    };

    if (messageCompose.channel === "mail") {
      customers.forEach((customer) => {
        if (customer.email) {
          addOption({ label: customer.name, value: customer.email, detail: customer.reference ?? "Cliente" });
        }
      });
      return options;
    }

    customers.forEach((customer) => {
      if (customer.phone) {
        addOption({ label: customer.name, value: customer.phone, detail: customer.reference ?? "Cliente" });
      }
    });
    whatsAppSync.chats.forEach((chat) => addOption({ label: chat.name || chat.id, value: chat.id, detail: "Chat WhatsApp" }));
    whatsAppSync.groups.forEach((group) => addOption({ label: group.name || group.id, value: group.id, detail: "Grupo WhatsApp" }));

    return options;
  }, [customers, messageCompose, whatsAppSync.chats, whatsAppSync.groups]);

  const normalCustomers = useMemo(
    () => customers.filter((customer) => (customer.type ?? "NORMAL") === "NORMAL"),
    [customers],
  );

  const thirdPartyCustomers = useMemo(
    () => customers.filter((customer) => customer.type === "THIRD_PARTY"),
    [customers],
  );

  const customerStats = useMemo(
    () => [
      { label: "Clientes", value: normalCustomers.length },
      { label: "Activos", value: normalCustomers.filter((customer) => customer.status === "ACTIVE").length },
      { label: "Prospectos", value: normalCustomers.filter((customer) => customer.status === "PROSPECT").length },
      { label: "Inactivos", value: normalCustomers.filter((customer) => customer.status === "INACTIVE").length },
    ],
    [normalCustomers],
  );

  const thirdPartyStats = useMemo(
    () => [
      { label: "Tercerizados", value: thirdPartyCustomers.length },
      { label: "Activos", value: thirdPartyCustomers.filter((customer) => customer.status === "ACTIVE").length },
      { label: "Con trabajos", value: thirdPartyCustomers.filter((customer) => customer._count.workOrders > 0).length },
      { label: "Presupuestos", value: thirdPartyCustomers.reduce((total, customer) => total + customer._count.quotes, 0) },
    ],
    [thirdPartyCustomers],
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const deviceStats = useMemo(
    () => [
      { label: "Equipos", value: devices.length },
      { label: "CCTV", value: devices.filter((device) => device.type === "CCTV").length },
      { label: "Alarmas", value: devices.filter((device) => device.type === "ALARM").length },
      { label: "GPS", value: devices.filter((device) => device.type === "GPS").length },
    ],
    [devices],
  );

  const workOrderStats = useMemo(
    () => [
      { label: "Trabajos", value: workOrderStatsSource.length },
      { label: "Programados", value: workOrderStatsSource.filter((workOrder) => workOrder.status === "SCHEDULED").length },
      { label: "En curso", value: workOrderStatsSource.filter((workOrder) => workOrder.status === "IN_PROGRESS").length },
      { label: "Completados", value: workOrderStatsSource.filter((workOrder) => workOrder.status === "COMPLETED").length },
    ],
    [workOrderStatsSource],
  );

  const selectedAgendaDate = useMemo(() => parseDateInput(agendaDate), [agendaDate]);

  const agendaItems = useMemo(
    () =>
      agendaOrders
        .filter((workOrder) => workOrder.scheduledAt)
        .sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime()),
    [agendaOrders],
  );

  const agendaMeetingItems = useMemo(
    () =>
      meetings
        .filter((meeting) => meeting.dateTime)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [meetings],
  );

  const agendaToday = useMemo(
    () => agendaItems.filter((workOrder) => isSameDay(workOrder.scheduledAt, selectedAgendaDate)),
    [agendaItems, selectedAgendaDate],
  );

  const agendaMeetingsToday = useMemo(
    () => agendaMeetingItems.filter((meeting) => isSameDay(meeting.dateTime, selectedAgendaDate)),
    [agendaMeetingItems, selectedAgendaDate],
  );

  const agendaOverdue = useMemo(
    () =>
      agendaItems.filter(
        (workOrder) =>
          workOrder.status !== "COMPLETED" &&
          workOrder.status !== "CANCELLED" &&
          startOfDay(new Date(workOrder.scheduledAt ?? "")).getTime() < startOfDay(selectedAgendaDate).getTime(),
      ),
    [agendaItems, selectedAgendaDate],
  );

  const agendaMeetingsOverdue = useMemo(
    () =>
      agendaMeetingItems.filter(
        (meeting) =>
          meeting.status !== "DONE" &&
          meeting.status !== "CANCELLED" &&
          startOfDay(new Date(meeting.dateTime)).getTime() < startOfDay(selectedAgendaDate).getTime(),
      ),
    [agendaMeetingItems, selectedAgendaDate],
  );

  const agendaWeek = useMemo(
    () =>
      agendaItems.filter((workOrder) => {
        const scheduledAt = new Date(workOrder.scheduledAt ?? "");
        const day = startOfDay(scheduledAt).getTime();
        const start = startOfDay(selectedAgendaDate).getTime();
        const end = addDays(startOfDay(selectedAgendaDate), 6).getTime();
        return day >= start && day <= end;
      }),
    [agendaItems, selectedAgendaDate],
  );

  const agendaMeetingsWeek = useMemo(
    () =>
      agendaMeetingItems.filter((meeting) => {
        const scheduledAt = new Date(meeting.dateTime);
        const day = startOfDay(scheduledAt).getTime();
        const start = startOfDay(selectedAgendaDate).getTime();
        const end = addDays(startOfDay(selectedAgendaDate), 6).getTime();
        return day >= start && day <= end;
      }),
    [agendaMeetingItems, selectedAgendaDate],
  );

  const agendaStats = useMemo(
    () => [
      { label: "Hoy", value: agendaToday.length + agendaMeetingsToday.length },
      { label: "Atrasados", value: agendaOverdue.length + agendaMeetingsOverdue.length },
      { label: "Semana", value: agendaWeek.length + agendaMeetingsWeek.length },
      { label: "Sin fecha", value: agendaOrders.filter((workOrder) => !workOrder.scheduledAt).length },
    ],
    [agendaMeetingsOverdue, agendaMeetingsToday, agendaMeetingsWeek, agendaOrders, agendaOverdue, agendaToday, agendaWeek],
  );

  const meetingStats = useMemo(
    () => [
      { label: "Reuniones", value: meetings.length },
      { label: "Pendientes", value: meetings.filter((meeting) => meeting.status === "PENDING").length },
      { label: "Aceptadas", value: meetings.filter((meeting) => meeting.status === "DONE").length },
      {
        label: "Seguimientos",
        value: meetings.filter((meeting) => meeting.followUpDate && meeting.status !== "CANCELLED").length,
      },
    ],
    [meetings],
  );

  const quoteStats = useMemo(
    () => [
      { label: "Presupuestos", value: quotes.length },
      { label: "Borradores", value: quotes.filter((quote) => quote.status === "DRAFT").length },
      { label: "Aprobados", value: quotes.filter((quote) => quote.status === "APPROVED").length },
      { label: "Total", value: formatCurrency(quotes.reduce((sum, quote) => sum + toMoneyNumber(quote.total), 0)) },
    ],
    [quotes],
  );

  const paymentStats = useMemo(
    () => [
      { label: "Cobros", value: payments.length },
      { label: "Pendientes", value: payments.filter((payment) => !payment.paidAt).length },
      { label: "Vencidos", value: payments.filter((payment) => isOverdue(payment)).length },
      {
        label: "A cobrar",
        value: formatCurrency(
          payments.filter((payment) => !payment.paidAt).reduce((sum, payment) => sum + toMoneyNumber(payment.amount), 0),
        ),
      },
    ],
    [payments],
  );

  const vehicleStats = useMemo(
    () => [
      { label: "Vehiculos", value: vehicles.length },
      { label: "Activos", value: vehicles.filter((vehicle) => vehicle.active).length },
      { label: "Inactivos", value: vehicles.filter((vehicle) => !vehicle.active).length },
      { label: "Con Traccar", value: vehicles.filter((vehicle) => vehicle.traccarDeviceId).length },
    ],
    [vehicles],
  );

  const visibleInventoryItems = useMemo(() => {
    if (inventoryMode === "stock" && inventoryStockFilter === "ALL") {
      return inventoryItems.filter((item) => item.managedStock && item.stock > 0);
    }

    return inventoryItems;
  }, [inventoryItems, inventoryMode, inventoryStockFilter]);

  const inventoryStats = useMemo(
    () => [
      { label: "Articulos", value: visibleInventoryItems.length },
      { label: "Catalogo", value: visibleInventoryItems.filter((item) => !item.managedStock).length },
      { label: "Instalados", value: visibleInventoryItems.reduce((total, item) => total + (item.installedQuantity ?? 0), 0) },
      { label: "Disponibles", value: visibleInventoryItems.reduce((total, item) => total + (item.managedStock ? item.stock : 0), 0) },
      { label: "Sin stock", value: visibleInventoryItems.filter((item) => item.managedStock && item.stock === 0).length },
    ],
    [visibleInventoryItems],
  );

  const gmailStats = useMemo(
    () => [
      { label: "No leidos", value: gmailSync.unread || gmailStatus.unread },
      { label: "Importantes", value: gmailSync.important || gmailStatus.important },
      { label: "Por responder", value: gmailSync.pendingReplies || gmailStatus.pendingReplies },
      {
        label: "Configuracion",
        value: `${gmailStatus.checks.filter((check) => check.configured).length}/${gmailStatus.checks.length || 4}`,
      },
    ],
    [gmailStatus, gmailSync],
  );

  const whatsAppStats = useMemo(
    () => [
      { label: "No leidos", value: whatsAppSync.unread || whatsAppStatus.unread },
      { label: "Chats activos", value: whatsAppSync.activeChats || whatsAppStatus.activeChats },
      { label: "Por responder", value: whatsAppSync.pendingReplies || whatsAppStatus.pendingReplies },
      {
        label: "Configuracion",
        value: `${whatsAppStatus.checks.filter((check) => check.configured).length}/${whatsAppStatus.checks.length || 4}`,
      },
    ],
    [whatsAppStatus, whatsAppSync],
  );

  useEffect(() => {
    try {
      const storedToken = window.localStorage.getItem("sscc_token");
      const storedUser = window.localStorage.getItem("sscc_user");

      if (!storedToken || !storedUser || isExpiredJwt(storedToken)) {
        redirectToLogin();
        return;
      }

      setToken(storedToken);
      setUser(JSON.parse(storedUser) as AuthUser);
    } catch {
      redirectToLogin();
      return;
    } finally {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadSummary(token);
    void loadCustomers(token);
    void loadDevices(token);
    void loadWorkOrders(token);
    void loadAgenda(token);
    void loadMeetings(token, null);
    void loadQuotes(token);
    void loadPriceBook(token);
    void loadPayments(token);
    void loadInventory(token);
    void loadVehicles(token);
    void loadGmailStatus(token);
    void syncGmail(token, true);
    void loadWhatsAppStatus(token);
    void loadWhatsAppDailySummary(token);
    void syncWhatsApp(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    switch (activeModule) {
      case "Dashboard":
        void loadSummary(token);
        break;
      case "Clientes":
        void loadCustomers(token);
        break;
      case "Tercerizados":
        void loadCustomers(token);
        break;
      case "Trabajos":
        setWorkStatus("ALL");
        void Promise.all([
          loadWorkOrders(token, null, "ALL"),
          loadAgenda(token),
          loadInventory(token, { mode: "all", category: "ALL", supplier: "ALL", search: "" }),
        ]);
        break;
      case "Agenda":
        void Promise.all([loadAgenda(token), loadMeetings(token, null)]);
        break;
      case "Despachador":
        void Promise.all([loadAgenda(token), loadMeetings(token, null), loadVehicles(token)]);
        break;
      case "Reuniones":
        void loadMeetings(token, null);
        break;
      case "Presupuestos":
        void Promise.all([
          loadQuotes(token),
          loadPriceBook(token),
          loadInventory(token, { mode: "all", category: "ALL", supplier: "ALL", search: "" }),
        ]);
        break;
      case "Cobros":
        void loadPayments(token);
        break;
      case "Almacen":
        void loadInventory(token);
        break;
      case "Equipos":
        void loadDevices(token);
        break;
      case "Vehiculos":
        void loadVehicles(token);
        break;
      case "Gmail":
        void syncGmail(token, true);
        break;
      case "WhatsApp":
        void loadWhatsAppDailySummary(token);
        void syncWhatsApp(token, true);
        break;
      default:
        break;
    }
  }, [activeModule, token]);

  useEffect(() => {
    if (activeModule === "Clientes" || activeModule === "Tercerizados") {
      const type: CustomerType = activeModule === "Tercerizados" ? "THIRD_PARTY" : "NORMAL";
      setCustomerForm((currentForm) => (editingCustomerId ? currentForm : { ...currentForm, type }));
    }
  }, [activeModule, editingCustomerId]);

  useEffect(() => {
    const customerId = quoteForm.customerId || selectedCustomerId || "";
    const points = Number(quoteForm.laborPoints) || 0;

    if (!token || activeModule !== "Presupuestos" || !customerId || points <= 0) {
      setQuoteLaborPreview(null);
      return;
    }

    const params = new URLSearchParams({ customerId, points: String(points) });
    let active = true;
    apiRequest<LaborPointCalculation>(`/api/price-book/labor-points/calculate?${params.toString()}`, { token })
      .then((data) => {
        if (active) {
          setQuoteLaborPreview(data);
        }
      })
      .catch(() => {
        if (active) {
          setQuoteLaborPreview(null);
        }
      });

    return () => {
      active = false;
    };
  }, [activeModule, quoteForm.customerId, quoteForm.laborPoints, selectedCustomerId, token]);

  useEffect(() => {
    if (!token || activeModule !== "Gmail") {
      return;
    }

    const interval = window.setInterval(() => {
      void syncGmail(token, true);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [activeModule, token]);

  useEffect(() => {
    if (!token || activeModule !== "WhatsApp") {
      return;
    }

    const interval = window.setInterval(() => {
      void syncWhatsApp(token, true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [activeModule, token]);

  useEffect(() => {
    if (!authRedirecting) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.assign("/login");
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [authRedirecting]);

  useEffect(() => {
    if (!token || activeModule !== "Dashboard") {
      return;
    }

    const interval = window.setInterval(() => {
      void loadSummary(token, true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [activeModule, token]);

  useEffect(() => {
    if (!token || activeModule !== "Trabajos") {
      return;
    }

    void loadInventory(token, { mode: "all", category: "ALL", supplier: "ALL", search: "" });
  }, [activeModule, token]);

  useEffect(() => {
    if (!token || activeModule !== "Almacen") {
      setInventoryCatalogMatches([]);
      return;
    }

    const query = inventoryForm.name.trim();
    if (query.length < 2) {
      setInventoryCatalogMatches([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ mode: "all", search: query });
        const data = await apiRequest<InventoryItem[]>(`/api/inventory?${params.toString()}`, { token });
        setInventoryCatalogMatches(data.slice(0, 8));
      } catch {
        setInventoryCatalogMatches([]);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [activeModule, inventoryForm.name, token]);

  async function loadSummary(activeToken = token, silent = false) {
    if (!activeToken) {
      return;
    }

    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await apiRequest<DashboardSummary>("/api/dashboard/summary", {
        token: activeToken,
      });
      setSummary(data);
      setStatus(`Dashboard actualizado${data.lastUpdatedAt ? ` ${formatDateTime(data.lastUpdatedAt)}` : ""}`);
    } catch {
      setSummary(fallbackSummary);
      setStatus("Backend o base de datos no disponible");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function loadCustomers(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setCustomersLoading(true);
    setCustomerError("");
    try {
      const params = new URLSearchParams();
      if (customerSearch.trim()) {
        params.set("search", customerSearch.trim());
      }
      if (customerStatus !== "ALL") {
        params.set("status", customerStatus);
      }

      const query = params.toString();
      const data = await apiRequest<Customer[]>(`/api/customers${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setCustomers(data);
      if (!selectedCustomerId && data[0]) {
        setSelectedCustomerId(data[0].id);
        void loadSites(data[0].id, activeToken);
      }
    } catch {
      setCustomerError("No se pudieron cargar los clientes");
    } finally {
      setCustomersLoading(false);
    }
  }

  async function loadSites(customerId = selectedCustomerId, activeToken = token) {
    if (!customerId || !activeToken) {
      setSites([]);
      return;
    }

    setSitesLoading(true);
    setSiteError("");
    try {
      const data = await apiRequest<CustomerSite[]>(`/api/customers/${customerId}/sites`, {
        token: activeToken,
      });
      setSites(data);
    } catch {
      setSiteError("No se pudieron cargar los sitios del cliente");
    } finally {
      setSitesLoading(false);
    }
  }

  async function loadDevices(activeToken = token, customerId = selectedCustomerId) {
    if (!activeToken) {
      return;
    }

    setDevicesLoading(true);
    setDeviceError("");
    try {
      const params = new URLSearchParams();
      if (deviceSearch.trim()) {
        params.set("search", deviceSearch.trim());
      }
      if (customerId) {
        params.set("customerId", customerId);
      }
      if (deviceType !== "ALL") {
        params.set("type", deviceType);
      }

      const query = params.toString();
      const data = await apiRequest<InstalledDevice[]>(`/api/devices${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setDevices(data);
    } catch {
      setDeviceError("No se pudieron cargar los equipos instalados");
    } finally {
      setDevicesLoading(false);
    }
  }

  async function loadWorkOrders(
    activeToken = token,
    customerId: string | null = null,
    statusFilter: WorkOrderStatus | "ALL" = workStatus,
    searchFilter = workSearch,
  ) {
    if (!activeToken) {
      return;
    }

    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      const params = new URLSearchParams();
      if (searchFilter.trim()) {
        params.set("search", searchFilter.trim());
      }
      if (customerId) {
        params.set("customerId", customerId);
      }
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const query = params.toString();
      const [data, statsData] = await Promise.all([
        apiRequest<WorkOrder[]>(`/api/work-orders${query ? `?${query}` : ""}`, {
          token: activeToken,
        }),
        apiRequest<WorkOrder[]>("/api/work-orders", {
          token: activeToken,
        }),
      ]);
      setWorkOrders(data);
      setWorkOrderStatsSource(statsData);
    } catch {
      setWorkOrderError("No se pudieron cargar los trabajos");
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  async function loadAgenda(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setAgendaLoading(true);
    setAgendaError("");
    try {
      const params = new URLSearchParams();
      if (agendaStatus !== "ALL") {
        params.set("status", agendaStatus);
      }

      const query = params.toString();
      const data = await apiRequest<WorkOrder[]>(`/api/work-orders${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setAgendaOrders(data);
    } catch {
      setAgendaError("No se pudo cargar la agenda");
    } finally {
      setAgendaLoading(false);
    }
  }

  async function loadMeetings(activeToken = token, customerId: string | null = null) {
    if (!activeToken) {
      return;
    }

    setMeetingsLoading(true);
    setMeetingError("");
    try {
      const params = new URLSearchParams();
      if (meetingSearch.trim()) {
        params.set("search", meetingSearch.trim());
      }
      if (customerId) {
        params.set("customerId", customerId);
      }
      if (meetingType !== "ALL") {
        params.set("type", meetingType);
      }
      if (meetingStatus !== "ALL") {
        params.set("status", meetingStatus);
      }

      const query = params.toString();
      const data = await apiRequest<Meeting[]>(`/api/meetings${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setMeetings(data);
    } catch {
      setMeetingError("No se pudieron cargar las reuniones");
    } finally {
      setMeetingsLoading(false);
    }
  }

  async function loadQuotes(activeToken = token, customerId: string | null = null) {
    if (!activeToken) {
      return;
    }

    setQuotesLoading(true);
    setQuoteError("");
    try {
      const params = new URLSearchParams();
      if (quoteSearch.trim()) {
        params.set("search", quoteSearch.trim());
      }
      if (customerId) {
        params.set("customerId", customerId);
      }
      if (quoteStatus !== "ALL") {
        params.set("status", quoteStatus);
      }

      const query = params.toString();
      const data = await apiRequest<Quote[]>(`/api/quotes${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setQuotes(data);
    } catch {
      setQuoteError("No se pudieron cargar los presupuestos");
    } finally {
      setQuotesLoading(false);
    }
  }

  async function loadPriceBook(activeToken = token) {
    if (!activeToken) {
      return;
    }

    try {
      const data = await apiRequest<PriceBookItem[]>("/api/price-book?active=true", {
        token: activeToken,
      });
      setPriceBookItems(data);
    } catch {
      setQuoteError("No se pudo cargar la base de precios");
    }
  }

  async function loadPayments(activeToken = token, customerId = selectedCustomerId) {
    if (!activeToken) {
      return;
    }

    setPaymentsLoading(true);
    setPaymentError("");
    try {
      const params = new URLSearchParams();
      if (paymentSearch.trim()) {
        params.set("search", paymentSearch.trim());
      }
      if (customerId) {
        params.set("customerId", customerId);
      }
      if (paymentStatus !== "ALL") {
        params.set("status", paymentStatus);
      }

      const query = params.toString();
      const data = await apiRequest<Payment[]>(`/api/payments${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setPayments(data);
    } catch {
      setPaymentError("No se pudieron cargar los cobros");
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function loadInventory(
    activeToken = token,
    options?: { mode?: "stock" | "catalog" | "all"; category?: DeviceType | "ALL"; supplier?: string; search?: string },
  ) {
    if (!activeToken) {
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      const params = new URLSearchParams();
      const search = options?.search ?? inventorySearch;
      const category = options?.category ?? inventoryCategory;
      const supplier = options?.supplier ?? inventorySupplier;
      const mode = options?.mode ?? inventoryMode;
      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (category !== "ALL") {
        params.set("category", category);
      }
      if (supplier !== "ALL") {
        params.set("supplier", supplier);
      }
      params.set("mode", mode);
      if (inventoryStockFilter === "LOW") {
        params.set("lowStock", "true");
      }

      const query = params.toString();
      const data = await apiRequest<InventoryItem[]>(`/api/inventory${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setInventoryItems(data);
      setInventoryMovementForm((currentForm) => ({
        ...currentForm,
        itemId: currentForm.itemId || data[0]?.id || "",
      }));
    } catch (error) {
      setInventoryError(`No se pudo cargar el almacen: ${getErrorMessage(error)}`);
    } finally {
      setInventoryLoading(false);
    }
  }

  async function loadVehicles(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setVehiclesLoading(true);
    setVehicleError("");
    try {
      const params = new URLSearchParams();
      if (vehicleSearch.trim()) {
        params.set("search", vehicleSearch.trim());
      }
      if (vehicleStatus !== "ALL") {
        params.set("active", vehicleStatus === "ACTIVE" ? "true" : "false");
      }

      const query = params.toString();
      const data = await apiRequest<Vehicle[]>(`/api/vehicles${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setVehicles(data);
    } catch {
      setVehicleError("No se pudieron cargar los vehiculos");
    } finally {
      setVehiclesLoading(false);
    }
  }

  async function loadGmailStatus(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setGmailLoading(true);
    setGmailError("");
    try {
      const data = await apiRequest<GmailStatus>("/api/gmail/status", {
        token: activeToken,
      });
      setGmailStatus(data);
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      setGmailStatus(fallbackGmailStatus);
      setGmailError(`No se pudo consultar el estado de Gmail: ${getErrorMessage(error)}`);
    } finally {
      setGmailLoading(false);
    }
  }

  async function syncGmail(activeToken = token, silent = false) {
    if (!activeToken) {
      return;
    }

    if (!silent) {
      setGmailLoading(true);
    }
    setGmailError("");
    try {
      const data = await apiRequest<GmailSync>("/api/gmail/sync", {
        token: activeToken,
      });
      setGmailSync(data);
      setGmailStatus((currentStatus) => ({
        ...currentStatus,
        connected: data.connected,
        lastSyncAt: data.lastSyncAt,
        unread: data.unread,
        important: data.important,
        pendingReplies: data.pendingReplies,
        checks: currentStatus.checks.some((check) => check.configured)
          ? currentStatus.checks
          : fallbackGmailStatus.checks.map((check) => ({ ...check, configured: true })),
      }));
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      setGmailError(`No se pudieron sincronizar los datos de Gmail: ${getErrorMessage(error)}`);
    } finally {
      if (!silent) {
        setGmailLoading(false);
      }
    }
  }

  async function loadWhatsAppStatus(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setWhatsAppLoading(true);
    setWhatsAppError("");
    try {
      const data = await apiRequest<WhatsAppStatus>("/api/whatsapp/status", {
        token: activeToken,
      });
      setWhatsAppStatus(data);
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      setWhatsAppStatus(fallbackWhatsAppStatus);
      setWhatsAppError(`No se pudo consultar el estado de WhatsApp: ${getErrorMessage(error)}`);
    } finally {
      setWhatsAppLoading(false);
    }
  }

  async function syncWhatsApp(activeToken = token, silent = false) {
    if (!activeToken) {
      return;
    }

    if (!silent) {
      setWhatsAppLoading(true);
    }
    setWhatsAppError("");
    try {
      const data = await apiRequest<WhatsAppSync>("/api/whatsapp/sync", {
        token: activeToken,
      });
      setWhatsAppSync(data);
      setWhatsAppStatus((currentStatus) => ({
        ...currentStatus,
        connected: data.connected,
        lastSyncAt: data.lastSyncAt,
        unread: data.unread,
        pendingReplies: data.pendingReplies,
        activeChats: data.activeChats,
        checks: currentStatus.checks.some((check) => check.configured)
          ? currentStatus.checks
          : fallbackWhatsAppStatus.checks.map((check) => ({ ...check, configured: true })),
      }));
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      setWhatsAppError(`No se pudieron sincronizar los datos de WhatsApp: ${getErrorMessage(error)}`);
    } finally {
      if (!silent) {
        setWhatsAppLoading(false);
      }
    }
  }

  async function loadWhatsAppDailySummary(activeToken = token) {
    if (!activeToken) {
      return;
    }

    try {
      const data = await apiRequest<WhatsAppDailyMeetingSummary>("/api/whatsapp/daily-meeting-summary", {
        token: activeToken,
      });
      setWhatsAppDailySummary(data);
      setWhatsAppDailySummaryForm({
        enabled: data.settings.enabled,
        recipientName: data.settings.recipientName ?? "",
        recipientPhone: data.settings.recipientPhone,
        sendTime: data.settings.sendTime,
        messageTemplate: data.settings.messageTemplate,
      });
    } catch (error) {
      setWhatsAppError(`No se pudo cargar el resumen diario: ${getErrorMessage(error)}`);
    }
  }

  async function saveWhatsAppDailySummary() {
    if (!token) {
      return;
    }

    setWhatsAppSummarySaving(true);
    setWhatsAppError("");
    try {
      const data = await apiRequest<WhatsAppDailyMeetingSummary>("/api/whatsapp/daily-meeting-summary", {
        token,
        method: "PATCH",
        body: JSON.stringify(whatsAppDailySummaryForm),
      });
      setWhatsAppDailySummary(data);
      setStatus("Resumen diario de reuniones actualizado.");
    } catch (error) {
      setWhatsAppError(`No se pudo guardar el resumen diario: ${getErrorMessage(error)}`);
    } finally {
      setWhatsAppSummarySaving(false);
    }
  }

  async function sendWhatsAppDailySummaryNow() {
    if (!token) {
      return;
    }

    setWhatsAppSummarySaving(true);
    setWhatsAppError("");
    try {
      const saved = await apiRequest<WhatsAppDailyMeetingSummary>("/api/whatsapp/daily-meeting-summary", {
        token,
        method: "PATCH",
        body: JSON.stringify(whatsAppDailySummaryForm),
      });
      setWhatsAppDailySummary(saved);
      const sent = await apiRequest<WhatsAppDailyMeetingSummary>("/api/whatsapp/daily-meeting-summary/send", {
        token,
        method: "POST",
      });
      setWhatsAppDailySummary(sent);
      setStatus("Resumen diario de reuniones enviado por WhatsApp.");
    } catch (error) {
      setWhatsAppError(`No se pudo enviar el resumen diario: ${getErrorMessage(error)}`);
    } finally {
      setWhatsAppSummarySaving(false);
    }
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !customerForm.name.trim()) {
      setCustomerError("El nombre del cliente es obligatorio");
      return;
    }

    const currentType: CustomerType = activeModule === "Tercerizados" ? "THIRD_PARTY" : "NORMAL";
    const payload = cleanCustomerPayload({
      ...customerForm,
      type: editingCustomerId ? customerForm.type ?? currentType : currentType,
    });
    const path = editingCustomerId ? `/api/customers/${editingCustomerId}` : "/api/customers";
    const method = editingCustomerId ? "PATCH" : "POST";

    setCustomersLoading(true);
    setCustomerError("");
    try {
      await apiRequest<Customer>(path, {
        token,
        method,
        body: JSON.stringify(payload),
      });
      setCustomerForm({ ...emptyCustomerForm, type: currentType });
      setEditingCustomerId(null);
      await Promise.all([loadCustomers(token), loadSummary(token)]);
    } catch (error) {
      setCustomerError(`No se pudo guardar el cliente: ${getErrorMessage(error)}`);
    } finally {
      setCustomersLoading(false);
    }
  }

  async function saveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedCustomerId) {
      setSiteError("Selecciona un cliente para cargar el sitio");
      return;
    }

    if (!siteForm.name.trim() || !siteForm.address.trim()) {
      setSiteError("Nombre y direccion del sitio son obligatorios");
      return;
    }

    setSitesLoading(true);
    setSiteError("");
    try {
      await apiRequest<CustomerSite>(`/api/customers/${selectedCustomerId}/sites`, {
        token,
        method: "POST",
        body: JSON.stringify(cleanSitePayload(siteForm)),
      });
      setSiteForm(emptySiteForm);
      await Promise.all([loadSites(selectedCustomerId, token), loadCustomers(token), loadSummary(token)]);
    } catch {
      setSiteError("No se pudo guardar el sitio");
    } finally {
      setSitesLoading(false);
    }
  }

  async function saveDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!deviceForm.siteId) {
      setDeviceError("Selecciona un sitio para instalar el equipo");
      return;
    }

    setDevicesLoading(true);
    setDeviceError("");
    try {
      await apiRequest<InstalledDevice>("/api/devices", {
        token,
        method: "POST",
        body: JSON.stringify(cleanDevicePayload(deviceForm)),
      });
      setDeviceForm(emptyDeviceForm);
      await Promise.all([loadDevices(token), selectedCustomerId ? loadSites(selectedCustomerId, token) : null, loadSummary(token)]);
    } catch {
      setDeviceError("No se pudo guardar el equipo");
    } finally {
      setDevicesLoading(false);
    }
  }

  function duplicateDevice(device: InstalledDevice) {
    setSelectedCustomerId(device.site.customer.id);
    void loadSites(device.site.customer.id, token);
    setDeviceForm({
      siteId: device.siteId,
      type: device.type,
      installedAt: device.installedAt ? toDateInputValue(new Date(device.installedAt)) : "",
      brand: device.brand ?? "",
      model: device.model ?? "",
      serial: "",
      ipAddress: "",
      notes: device.notes ?? "",
    });
    setDeviceError("Equipo duplicado en el formulario. Completa serie/IP y guarda el nuevo registro.");
  }

  function editWorkOrder(workOrder: WorkOrder) {
    setSelectedCustomerId(workOrder.customerId);
    void loadSites(workOrder.customerId, token);
    setEditingWorkOrderId(workOrder.id);
    setWorkOrderForm({
      customerId: workOrder.customerId,
      siteId: workOrder.siteId ?? "",
      title: workOrder.title,
      type: workOrder.type,
      status: workOrder.status,
      scheduledAt: workOrder.scheduledAt ? toDateTimeLocalValue(new Date(workOrder.scheduledAt)) : "",
      completedAt: workOrder.completedAt ?? "",
      notes: workOrder.notes ?? "",
      reportBeforeNotes: workOrder.reportBeforeNotes ?? "",
      reportAfterNotes: workOrder.reportAfterNotes ?? "",
      reportTasks: workOrder.reportTasks ?? "",
      reportTests: workOrder.reportTests ?? "",
      reportRecommendations: workOrder.reportRecommendations ?? "",
      reportPhotos: workOrder.reportPhotos ?? [],
    });
    setWorkOrderError("");
  }

  function cancelWorkOrderEdit() {
    setEditingWorkOrderId(null);
    setWorkOrderForm({ ...emptyWorkOrderForm, customerId: selectedCustomerId ?? "" });
    setWorkOrderError("");
  }

  async function saveWorkOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const customerId = workOrderForm.customerId || selectedCustomerId || "";
    if (!customerId || !workOrderForm.title.trim()) {
      setWorkOrderError("Selecciona un cliente y escribe el titulo del trabajo");
      return;
    }

    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      const payload = cleanWorkOrderPayload({ ...workOrderForm, customerId });
      if (payload.status === "COMPLETED") {
        payload.completedAt = payload.completedAt || new Date().toISOString();
      } else if (editingWorkOrderId) {
        payload.completedAt = "";
      }

      await apiRequest<WorkOrder>(editingWorkOrderId ? `/api/work-orders/${editingWorkOrderId}` : "/api/work-orders", {
        token,
        method: editingWorkOrderId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setEditingWorkOrderId(null);
      setWorkOrderForm({ ...emptyWorkOrderForm, customerId: selectedCustomerId ?? "" });
      await Promise.all([loadWorkOrders(token), loadAgenda(token), loadCustomers(token), loadSummary(token)]);
    } catch {
      setWorkOrderError(editingWorkOrderId ? "No se pudo actualizar el trabajo" : "No se pudo guardar el trabajo");
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  async function saveQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const customerId = quoteForm.customerId || "";
    if (!customerId || !quoteForm.title.trim()) {
      setQuoteError("Selecciona un cliente de las sugerencias y escribe el titulo del presupuesto");
      return;
    }

    setQuotesLoading(true);
    setQuoteError("");
    try {
      await apiRequest<Quote>(editingQuoteId ? `/api/quotes/${editingQuoteId}` : "/api/quotes", {
        token,
        method: editingQuoteId ? "PATCH" : "POST",
        body: JSON.stringify(cleanQuotePayload({ ...quoteForm, customerId })),
      });
      setEditingQuoteId(null);
      setQuoteForm({ ...emptyQuoteForm, customerId: selectedCustomerId ?? "" });
      await Promise.all([loadQuotes(token), loadCustomers(token), loadSummary(token)]);
    } catch (error) {
      setQuoteError(`${editingQuoteId ? "No se pudo actualizar" : "No se pudo guardar"} el presupuesto: ${getErrorMessage(error)}`);
    } finally {
      setQuotesLoading(false);
    }
  }

  function editQuote(quote: Quote) {
    setEditingQuoteId(quote.id);
    setQuoteForm({
      customerId: quote.customerId,
      meetingId: quote.meetingId ?? undefined,
      number: quote.number,
      title: quote.title,
      service: quote.service,
      status: quote.status,
      pricingMode: quote.pricingMode,
      currency: quote.currency,
      issueDate: quote.issueDate,
      validUntil: quote.validUntil ?? undefined,
      taxIncluded: quote.taxIncluded,
      discountPercent: toMoneyNumber(quote.discountPercent),
      discountAmount: toMoneyNumber(quote.discountAmount),
      profitMarginPercent: toMoneyNumber(quote.profitMarginPercent),
      laborPoints: toMoneyNumber(quote.laborPoints),
      subtotal: toMoneyNumber(quote.subtotal),
      tax: toMoneyNumber(quote.tax),
      internalNotes: quote.internalNotes ?? "",
      commercialTerms: quote.commercialTerms ?? "",
      executionTime: quote.executionTime ?? "",
      warranty: quote.warranty ?? "",
      paymentTerms: quote.paymentTerms ?? "",
      items: (quote.items ?? []).map((item) => ({
        priceBookItemId: item.priceBookItemId ?? undefined,
        type: item.type,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        unitCost: item.unitCost,
      })),
    });
    setSelectedCustomerId(quote.customerId);
    setQuoteError("");
  }

  function cancelQuoteEdit() {
    setEditingQuoteId(null);
    setQuoteForm({ ...emptyQuoteForm, customerId: selectedCustomerId ?? "" });
    setQuoteError("");
  }

  async function saveMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const customerId = meetingForm.customerId || selectedCustomerId || "";
    if (!customerId || !meetingForm.dateTime || !meetingForm.objective.trim()) {
      setMeetingError("Selecciona un cliente, fecha y objetivo de la reunion");
      return;
    }

    setMeetingsLoading(true);
    setMeetingError("");
    try {
      await apiRequest<Meeting>(editingMeetingId ? `/api/meetings/${editingMeetingId}` : "/api/meetings", {
        token,
        method: editingMeetingId ? "PATCH" : "POST",
        body: JSON.stringify(cleanMeetingPayload({ ...meetingForm, customerId })),
      });
      setEditingMeetingId(null);
      setMeetingForm({ ...emptyMeetingForm, customerId: "" });
      await Promise.all([loadMeetings(token, null), loadAgenda(token), loadCustomers(token), loadSummary(token)]);
    } catch (error) {
      setMeetingError(`No se pudo ${editingMeetingId ? "actualizar" : "guardar"} la reunion: ${getErrorMessage(error)}`);
    } finally {
      setMeetingsLoading(false);
    }
  }

  function editMeeting(meeting: Meeting) {
    setEditingMeetingId(meeting.id);
    setSelectedCustomerId(meeting.customerId);
    setMeetingForm({
      customerId: meeting.customerId,
      dateTime: toDateTimeLocalValue(new Date(meeting.dateTime)),
      contact: meeting.contact ?? "",
      type: meeting.type,
      status: meeting.status,
      objective: meeting.objective,
      notes: meeting.notes ?? "",
      commitments: meeting.commitments ?? "",
      nextStep: meeting.nextStep ?? "",
      followUpDate: meeting.followUpDate ? toDateInputValue(new Date(meeting.followUpDate)) : "",
      attendees: meeting.attendees ?? "",
      needs: meeting.needs ?? "",
      equipmentNeeded: meeting.equipmentNeeded ?? "",
      estimatedBudget: meeting.estimatedBudget ? toMoneyNumber(meeting.estimatedBudget) : 0,
      closeProbability: meeting.closeProbability ?? 50,
      reminderEnabled: meeting.reminderEnabled ?? true,
      reminderMinutesBefore: meeting.reminderMinutesBefore ?? 30,
      attachments: [],
    });
    setMeetingError("");
    window.setTimeout(() => {
      document.querySelector(".meetingForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function cancelMeetingEdit() {
    setEditingMeetingId(null);
    setMeetingForm({ ...emptyMeetingForm, customerId: "" });
    setMeetingError("");
  }

  function updateMeetingStatus(id: string, status: MeetingStatus) {
    if (!token) {
      return;
    }

    setMeetingsLoading(true);
    setMeetingError("");
    apiRequest<Meeting>(`/api/meetings/${id}`, {
      token,
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
      .then(() => Promise.all([loadMeetings(token, null), loadAgenda(token), loadCustomers(token)]))
      .catch((error) => setMeetingError(`No se pudo actualizar la reunion: ${getErrorMessage(error)}`))
      .finally(() => setMeetingsLoading(false));
  }

  async function savePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const customerId = paymentForm.customerId || selectedCustomerId || "";
    if (!customerId || !paymentForm.concept.trim()) {
      setPaymentError("Selecciona un cliente y escribe el concepto del cobro");
      return;
    }

    setPaymentsLoading(true);
    setPaymentError("");
    try {
      await apiRequest<Payment>("/api/payments", {
        token,
        method: "POST",
        body: JSON.stringify(cleanPaymentPayload({ ...paymentForm, customerId })),
      });
      setPaymentForm({ ...emptyPaymentForm, customerId: selectedCustomerId ?? "" });
      await Promise.all([loadPayments(token), loadCustomers(token), loadSummary(token)]);
    } catch {
      setPaymentError("No se pudo guardar el cobro");
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!vehicleForm.name.trim()) {
      setVehicleError("El nombre del vehiculo es obligatorio");
      return;
    }

    setVehiclesLoading(true);
    setVehicleError("");
    try {
      await apiRequest<Vehicle>("/api/vehicles", {
        token,
        method: "POST",
        body: JSON.stringify(cleanVehiclePayload(vehicleForm)),
      });
      setVehicleForm(emptyVehicleForm);
      await Promise.all([loadVehicles(token), loadSummary(token)]);
    } catch {
      setVehicleError("No se pudo guardar el vehiculo");
    } finally {
      setVehiclesLoading(false);
    }
  }

  async function saveInventoryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!inventoryForm.name.trim()) {
      setInventoryError("El nombre del articulo es obligatorio");
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      await apiRequest<InventoryItem>(editingInventoryItemId ? `/api/inventory/${editingInventoryItemId}` : "/api/inventory", {
        token,
        method: editingInventoryItemId ? "PATCH" : "POST",
        body: JSON.stringify(cleanInventoryPayload(inventoryForm)),
      });
      setEditingInventoryItemId(null);
      setInventoryForm(emptyInventoryForm);
      await Promise.all([loadInventory(token), loadSummary(token)]);
    } catch (error) {
      setInventoryError(
        `${editingInventoryItemId ? "No se pudo actualizar el articulo" : "No se pudo guardar el articulo"}: ${getErrorMessage(error)}`,
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  async function saveInventoryMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    if (!inventoryMovementForm.itemId || Number(inventoryMovementForm.quantity) < 0) {
      setInventoryError("Selecciona un articulo y una cantidad valida");
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      await apiRequest("/api/inventory/movements", {
        token,
        method: "POST",
        body: JSON.stringify(cleanInventoryMovementPayload(inventoryMovementForm)),
      });
      setInventoryMovementForm((currentForm) => ({
        ...emptyInventoryMovementForm,
        itemId: currentForm.itemId,
      }));
      await Promise.all([loadInventory(token), loadSummary(token)]);
    } catch (error) {
      setInventoryError(`No se pudo registrar el movimiento: ${getErrorMessage(error)}`);
    } finally {
      setInventoryLoading(false);
    }
  }

  async function quickInventoryMovement(itemId: string, type: InventoryMovementType, quantity: number) {
    if (!token) {
      return;
    }

    if (!itemId || quantity < 0) {
      setInventoryError("Selecciona un articulo y una cantidad valida");
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      await apiRequest("/api/inventory/movements", {
        token,
        method: "POST",
        body: JSON.stringify({
          itemId,
          type,
          quantity,
          reason: type === "IN" ? "Entrada al almacen" : "Ajuste manual de stock",
        }),
      });
      await Promise.all([loadInventory(token), loadSummary(token)]);
    } catch (error) {
      setInventoryError(`No se pudo ajustar el stock: ${getErrorMessage(error)}`);
    } finally {
      setInventoryLoading(false);
    }
  }

  function editInventoryItem(item: InventoryItem) {
    setEditingInventoryItemId(item.id);
    setInventoryForm({
      sku: item.sku ?? "",
      name: item.name,
      category: item.category ?? "",
      unit: item.unit,
      stock: item.stock,
      minStock: item.minStock,
      managedStock: item.managedStock,
      location: item.location ?? "",
      supplier: item.supplier ?? "",
      supplierCategory: item.supplierCategory ?? "",
      costPrice: typeof item.costPrice === "number" ? item.costPrice : item.costPrice ? Number(item.costPrice) : undefined,
      taxAmount: typeof item.taxAmount === "number" ? item.taxAmount : item.taxAmount ? Number(item.taxAmount) : undefined,
      priceWithTax: typeof item.priceWithTax === "number" ? item.priceWithTax : item.priceWithTax ? Number(item.priceWithTax) : undefined,
      currency: item.currency ?? "USD",
      notes: item.notes ?? "",
    });
    setInventoryError("");
  }

  function cancelInventoryEdit() {
    setEditingInventoryItemId(null);
    setInventoryForm(emptyInventoryForm);
    setInventoryError("");
  }

  async function deleteInventoryItem(item: InventoryItem) {
    if (!token) {
      return;
    }

    if (!window.confirm(`Eliminar ${item.name} del almacen?`)) {
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      await apiRequest(`/api/inventory/${item.id}`, {
        token,
        method: "DELETE",
      });
      if (editingInventoryItemId === item.id) {
        cancelInventoryEdit();
      }
      await Promise.all([loadInventory(token), loadSummary(token)]);
    } catch (error) {
      const message = getErrorMessage(error);
      setInventoryError(
        message.toLowerCase().includes("inventory item has movements")
          ? "No se puede eliminar el articulo porque tiene movimientos. Elimina o revierte esos movimientos primero."
          : `No se pudo eliminar el articulo: ${message}`,
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  async function deleteInventoryMovement(movementId: string) {
    if (!token) {
      return;
    }

    if (!window.confirm("Eliminar este movimiento y revertir el stock?")) {
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      await apiRequest(`/api/inventory/movements/${movementId}`, {
        token,
        method: "DELETE",
      });
      await Promise.all([loadInventory(token), loadSummary(token)]);
    } catch (error) {
      setInventoryError(`No se pudo eliminar el movimiento: ${getErrorMessage(error)}`);
    } finally {
      setInventoryLoading(false);
    }
  }

  async function addWorkOrderMaterial(workOrderId: string, itemId: string, quantity: number, installAsDevice: boolean) {
    if (!token) {
      return;
    }

    if (!workOrderId || !itemId || quantity <= 0) {
      setWorkOrderError("Selecciona un articulo y una cantidad mayor a cero");
      return;
    }

    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      await apiRequest(`/api/work-orders/${workOrderId}/materials`, {
        token,
        method: "POST",
        body: JSON.stringify({
          itemId,
          quantity,
          installAsDevice,
        }),
      });
      await Promise.all([
        loadWorkOrders(token),
        loadInventory(token, { mode: "all", category: "ALL", supplier: "ALL", search: "" }),
        loadDevices(token),
        loadSummary(token),
      ]);
    } catch (error) {
      const message = getErrorMessage(error);
      setWorkOrderError(
        message.toLowerCase().includes("stock cannot be negative")
          ? "No se pudo agregar el material al trabajo: no hay stock suficiente para esa cantidad"
          : message.toLowerCase().includes("work order site is required")
            ? "No se pudo agregar el material al trabajo: selecciona un sitio en la orden para registrar equipos instalados"
          : `No se pudo agregar el material al trabajo: ${message}`,
      );
      await loadInventory(token, { mode: "all", category: "ALL", supplier: "ALL", search: "" });
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  async function removeWorkOrderMaterial(movementIds: string | string[]) {
    if (!token) {
      return;
    }

    const ids = Array.isArray(movementIds) ? movementIds : [movementIds];
    if (!ids.length) {
      return;
    }

    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      for (const movementId of ids) {
        await apiRequest(`/api/inventory/movements/${movementId}`, {
          token,
          method: "DELETE",
        });
      }
      await Promise.all([
        loadWorkOrders(token),
        loadInventory(token, { mode: "all", category: "ALL", supplier: "ALL", search: "" }),
        loadDevices(token),
        loadSummary(token),
      ]);
    } catch (error) {
      setWorkOrderError(`No se pudo eliminar el material del trabajo: ${getErrorMessage(error)}`);
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  async function acceptQuote(id: string, scheduledAt?: string) {
    if (!token) {
      return;
    }

    const quote = quotes.find((item) => item.id === id);
    if (!quote) {
      setQuoteError("No se encontro el presupuesto para aprobar");
      return;
    }

    if (!scheduledAt) {
      setQuoteError("Selecciona dia y hora de ejecucion para crear la orden de trabajo y enviarla a la agenda.");
      return;
    }

    setQuotesLoading(true);
    setQuoteError("");
    try {
      await apiRequest<Quote>(`/api/quotes/${id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ status: "APPROVED", acceptedAt: new Date().toISOString() }),
      });
      await apiRequest<WorkOrder>("/api/work-orders", {
        token,
        method: "POST",
        body: JSON.stringify({
          customerId: quote.customerId,
          title: quote.title,
          type: quote.service,
          status: "SCHEDULED",
          scheduledAt,
          notes: buildQuoteWorkOrderNotes(quote),
        } satisfies WorkOrderPayload),
      });
      await Promise.all([loadQuotes(token), loadCustomers(token), loadWorkOrders(token), loadAgenda(token), loadSummary(token)]);
      setStatus("Presupuesto aprobado. Orden de trabajo creada y enviada a agenda.");
    } catch (error) {
      setQuoteError(`No se pudo aceptar el presupuesto: ${getErrorMessage(error)}`);
    } finally {
      setQuotesLoading(false);
    }
  }

  async function markPaymentPaid(id: string) {
    if (!token) {
      return;
    }

    setPaymentsLoading(true);
    setPaymentError("");
    try {
      await apiRequest<Payment>(`/api/payments/${id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ paidAt: new Date().toISOString() }),
      });
      await Promise.all([loadPayments(token), loadSummary(token)]);
    } catch {
      setPaymentError("No se pudo marcar el cobro como pagado");
    } finally {
      setPaymentsLoading(false);
    }
  }

  async function toggleVehicleActive(vehicle: Vehicle) {
    if (!token) {
      return;
    }

    setVehiclesLoading(true);
    setVehicleError("");
    try {
      await apiRequest<Vehicle>(`/api/vehicles/${vehicle.id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ active: !vehicle.active }),
      });
      await Promise.all([loadVehicles(token), loadSummary(token)]);
    } catch {
      setVehicleError("No se pudo actualizar el vehiculo");
    } finally {
      setVehiclesLoading(false);
    }
  }

  async function deleteVehicle(vehicle: Vehicle) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(`Eliminar el vehiculo "${vehicle.name}"? Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    setVehiclesLoading(true);
    setVehicleError("");
    try {
      await apiRequest<Vehicle>(`/api/vehicles/${vehicle.id}`, {
        token,
        method: "DELETE",
      });
      await Promise.all([loadVehicles(token), loadSummary(token)]);
    } catch {
      setVehicleError("No se pudo eliminar el vehiculo");
    } finally {
      setVehiclesLoading(false);
    }
  }

  async function updateWorkOrderStatus(id: string, nextStatus: WorkOrderStatus) {
    if (!token) {
      return;
    }

    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      await apiRequest<WorkOrder>(`/api/work-orders/${id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : undefined,
        }),
      });
      await Promise.all([loadWorkOrders(token), loadAgenda(token), loadSummary(token)]);
    } catch {
      setWorkOrderError("No se pudo actualizar el estado del trabajo");
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  function editCustomer(customer: Customer) {
    selectCustomer(customer.id);
    setCustomerProfile(null);
    setCustomerProfileError("");
    setActiveModule(customer.type === "THIRD_PARTY" ? "Tercerizados" : "Clientes");
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      legalName: customer.legalName ?? "",
      taxId: customer.taxId ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      latitude: customer.latitude === null || customer.latitude === undefined ? undefined : Number(customer.latitude),
      longitude: customer.longitude === null || customer.longitude === undefined ? undefined : Number(customer.longitude),
      logoUrl: customer.logoUrl ?? "",
      type: customer.type ?? "NORMAL",
      status: customer.status,
      notes: customer.notes ?? "",
    });
  }

  function selectCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    setWorkOrderForm((currentForm) => ({ ...currentForm, customerId, siteId: "" }));
    setMeetingForm((currentForm) => ({ ...currentForm, customerId }));
    setQuoteForm((currentForm) => ({ ...currentForm, customerId }));
    setPaymentForm((currentForm) => ({ ...currentForm, customerId }));
    void loadSites(customerId);
    void loadDevices(token, customerId);
    void loadWorkOrders(token, null, "ALL");
    void loadMeetings(token, customerId);
    void loadQuotes(token);
    void loadPayments(token, customerId);
  }

  async function openCustomerProfile(customer: Customer) {
    if (!token) {
      return;
    }

    selectCustomer(customer.id);
    setCustomerProfile(null);
    setCustomerProfileError("");
    setCustomerProfileLoading(true);
    try {
      const profile = await apiRequest<CustomerProfile>(`/api/customers/${customer.id}/profile`, { token });
      setCustomerProfile(profile);
    } catch (error) {
      setCustomerProfileError(`No se pudo cargar la ficha del cliente: ${getErrorMessage(error)}`);
    } finally {
      setCustomerProfileLoading(false);
    }
  }

  async function addCustomerDocument(customerId: string, payload: CustomerDocumentPayload) {
    if (!token) {
      return;
    }

    const document = await apiRequest<CustomerDocument>(`/api/customers/${customerId}/documents`, {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    });

    setCustomerProfile((current) =>
      current && current.customer.id === customerId ? { ...current, documents: [document, ...current.documents] } : current,
    );
  }

  async function deleteCustomerDocument(customerId: string, documentId: string) {
    if (!token) {
      return;
    }

    if (!window.confirm("Eliminar este documento adjunto?")) {
      return;
    }

    try {
      await apiRequest<CustomerDocument>(`/api/customers/${customerId}/documents/${documentId}`, {
        token,
        method: "DELETE",
      });
      setCustomerDocumentView((current) => (current?.document.id === documentId ? null : current));
      setCustomerProfile((current) =>
        current && current.customer.id === customerId
          ? { ...current, documents: current.documents.filter((document) => document.id !== documentId) }
          : current,
      );
    } catch (error) {
      window.alert(`No se pudo eliminar el documento: ${getErrorMessage(error)}`);
    }
  }

  function openCustomerDocumentModal(customer: Customer, document: CustomerDocument) {
    setCustomerProfile(null);
    setCustomerDocumentView({ customer, document });
  }

  async function openWorkOrderFromCustomerProfile(workOrder: WorkOrder) {
    if (!token) {
      return;
    }

    setCustomerProfile(null);
    setCustomerProfileError("");
    setActiveModule("Trabajos");
    setFocusedWorkOrderId(workOrder.id);
    setWorkSearch("");
    setWorkStatus("ALL");
    setSelectedCustomerId(workOrder.customerId);
    setWorkOrderForm((currentForm) => ({ ...currentForm, customerId: workOrder.customerId, siteId: "" }));
    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      const params = new URLSearchParams({ customerId: workOrder.customerId });
      const data = await apiRequest<WorkOrder[]>(`/api/work-orders?${params.toString()}`, { token });
      setWorkOrders(data);
      await Promise.all([
        loadSites(workOrder.customerId, token),
        loadInventory(token, { mode: "stock", category: "ALL", supplier: "ALL", search: "" }),
      ]);
      window.setTimeout(() => {
        document.getElementById(`work-order-${workOrder.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    } catch (error) {
      setWorkOrderError(`No se pudo abrir la orden de trabajo: ${getErrorMessage(error)}`);
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  async function openDeviceGroupFromCustomerProfile(group: GroupedInstalledDevice) {
    if (!token) {
      return;
    }

    const customerId = group.sample.site.customer.id;
    setCustomerProfile(null);
    setCustomerProfileError("");
    setActiveModule("Equipos");
    setFocusedDeviceGroupKey(group.key);
    setDeviceSearch(group.model);
    setDeviceType(group.type);
    setSelectedCustomerId(customerId);
    setDeviceForm((currentForm) => ({ ...currentForm, siteId: "", type: group.type }));
    setDevicesLoading(true);
    setDeviceError("");
    try {
      const params = new URLSearchParams({
        customerId,
        search: group.model,
        type: group.type,
      });
      const data = await apiRequest<InstalledDevice[]>(`/api/devices?${params.toString()}`, { token });
      setDevices(data);
      await loadSites(customerId, token);
    } catch (error) {
      setDeviceError(`No se pudo abrir el equipo instalado: ${getErrorMessage(error)}`);
    } finally {
      setDevicesLoading(false);
    }
  }

  function cancelCustomerEdit() {
    setEditingCustomerId(null);
    setCustomerForm({ ...emptyCustomerForm, type: activeModule === "Tercerizados" ? "THIRD_PARTY" : "NORMAL" });
    setCustomerError("");
  }

  function captureCustomerLocation() {
    if (!window.isSecureContext) {
      setCustomerError(
        "El navegador bloquea la ubicacion en HTTP. Para usarla desde el celular hay que entrar por HTTPS.",
      );
      return;
    }

    if (!navigator.geolocation) {
      setCustomerError("Este navegador no permite geolocalizacion");
      return;
    }

    setLocating(true);
    setCustomerError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = (await response.json()) as { display_name?: string };
          const address = data.display_name?.trim();

          setCustomerForm((currentForm) => ({
            ...currentForm,
            address: address || `GPS: ${latitude}, ${longitude}`,
            latitude: Number(latitude),
            longitude: Number(longitude),
          }));
        } catch {
          setCustomerForm((currentForm) => ({
            ...currentForm,
            address: `GPS: ${latitude}, ${longitude}`,
            latitude: Number(latitude),
            longitude: Number(longitude),
          }));
          setCustomerError("No se pudo convertir la ubicacion en direccion");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setCustomerError("No se pudo obtener la ubicacion del equipo");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  }

  function captureSiteLocation() {
    if (!window.isSecureContext) {
      setSiteError("El navegador bloquea la ubicacion en HTTP. Para usarla desde el celular hay que entrar por HTTPS.");
      return;
    }

    if (!navigator.geolocation) {
      setSiteError("Este navegador no permite geolocalizacion");
      return;
    }

    setSiteLocating(true);
    setSiteError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = (await response.json()) as { display_name?: string };
          const address = data.display_name?.trim();

          setSiteForm((currentForm) => ({
            ...currentForm,
            address: address || `GPS: ${latitude}, ${longitude}`,
            latitude: Number(latitude),
            longitude: Number(longitude),
          }));
        } catch {
          setSiteForm((currentForm) => ({
            ...currentForm,
            address: `GPS: ${latitude}, ${longitude}`,
            latitude: Number(latitude),
            longitude: Number(longitude),
          }));
          setSiteError("No se pudo convertir la ubicacion en direccion");
        } finally {
          setSiteLocating(false);
        }
      },
      () => {
        setSiteError("No se pudo obtener la ubicacion del equipo");
        setSiteLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  }

  function logout() {
    redirectToLogin();
  }

  function handleAuthError(error: unknown) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      return false;
    }

    setToken(null);
    setUser(null);
    redirectToLogin();
    return true;
  }

  function redirectToLogin() {
    try {
      window.localStorage.removeItem("sscc_token");
      window.localStorage.removeItem("sscc_user");
    } catch {
      // Ignore storage errors during recovery; the important part is leaving the loading screen.
    }
    setAuthChecked(true);
    setAuthRedirecting(true);
    router.replace("/login");
  }

  function printWorkOrderDocument() {
    window.print();
  }

  function printCustomerDocument(document: CustomerDocument) {
    const target = document.dataUrl || document.url;
    if (!target) {
      window.alert("Este documento no tiene archivo asociado.");
      return;
    }

    const printWindow = window.open(target, "_blank", "noopener,noreferrer");
    printWindow?.focus();
  }

  function composeWorkOrderWhatsApp(workOrder: WorkOrder) {
    setMessageError("");
    setMessageCompose({
      channel: "whatsapp",
      title: `WhatsApp - ${workOrder.customer.name}`,
      to: workOrder.customer.phone ?? "",
      subject: `Orden de trabajo - ${workOrder.title}`,
      message: buildWorkOrderShareText(workOrder),
      customerId: workOrder.customer.id,
      workOrderId: workOrder.id,
    });
  }

  function composeWorkOrderMail(workOrder: WorkOrder) {
    setMessageError("");
    setMessageCompose({
      channel: "mail",
      title: `Mail - ${workOrder.customer.name}`,
      to: workOrder.customer.email ?? "",
      subject: `Orden de trabajo - ${workOrder.title}`,
      message: buildWorkOrderShareText(workOrder),
      customerId: workOrder.customer.id,
      workOrderId: workOrder.id,
    });
  }

  function composeQuoteWhatsApp(quote: Quote) {
    setMessageError("");
    setMessageCompose({
      channel: "whatsapp",
      title: `WhatsApp - ${quote.customer.name}`,
      to: quote.customer.phone ?? "",
      subject: `Presupuesto ${quote.number} - ${quote.title}`,
      message: buildQuoteShareText(quote),
      customerId: quote.customer.id,
    });
  }

  async function composeQuoteMail(quote: Quote) {
    const attachment = await buildQuoteTemplateAttachment(quote);
    setMessageError("");
    setMessageCompose({
      channel: "mail",
      title: `Mail - ${quote.customer.name}`,
      to: quote.customer.email ?? "",
      subject: `Presupuesto ${quote.number} - ${quote.title}`,
      message: `Hola ${quote.customer.name},\n\nTe enviamos adjunto el presupuesto ${quote.number}: ${quote.title}.\n\nQuedamos a las ordenes.\nSecurity Solutions`,
      attachment,
      customerId: quote.customer.id,
    });
  }

  function composeCustomerWhatsApp(customer: Customer) {
    setMessageError("");
    setMessageCompose({
      channel: "whatsapp",
      title: `WhatsApp - ${customer.name}`,
      to: customer.phone ?? "",
      subject: `Mensaje para ${customer.name}`,
      message: buildCustomerShareText(customer),
      customerId: customer.id,
    });
  }

  function composeWhatsAppChat(chat: WhatsAppChat) {
    setMessageError("");
    setMessageCompose({
      channel: "whatsapp",
      title: `Responder - ${chat.name || chat.id}`,
      to: chat.id,
      subject: `WhatsApp - ${chat.name || chat.id}`,
      message: "",
    });
  }

  function composeCustomerMail(customer: Customer) {
    setMessageError("");
    setMessageCompose({
      channel: "mail",
      title: `Mail - ${customer.name}`,
      to: customer.email ?? "",
      subject: `Security Solutions - ${customer.name}`,
      message: buildCustomerShareText(customer),
      customerId: customer.id,
    });
  }

  function composeCustomerDocumentWhatsApp(customer: Customer, document: CustomerDocument) {
    setMessageError("");
    setMessageCompose({
      channel: "whatsapp",
      title: `WhatsApp - ${customer.name}`,
      to: customer.phone ?? "",
      subject: `Documento - ${document.name}`,
      message: buildCustomerDocumentShareText(customer, document),
      customerId: customer.id,
    });
  }

  function composeCustomerDocumentMail(customer: Customer, document: CustomerDocument) {
    setMessageError("");
    setMessageCompose({
      channel: "mail",
      title: `Mail - ${customer.name}`,
      to: customer.email ?? "",
      subject: `Documento adjunto - ${document.name}`,
      message: buildCustomerDocumentShareText(customer, document),
      customerId: customer.id,
    });
  }

  async function sendComposedMessage() {
    if (!token || !messageCompose) {
      return;
    }

    setMessageSending(true);
    setMessageError("");

    try {
      if (messageCompose.channel === "whatsapp") {
        await apiRequest("/api/whatsapp/send", {
          method: "POST",
          token,
          body: JSON.stringify({
            to: messageCompose.to,
            message: messageCompose.message,
            customerId: messageCompose.customerId,
            workOrderId: messageCompose.workOrderId,
          }),
        });
      } else {
        await apiRequest("/api/gmail/send", {
          method: "POST",
          token,
          body: JSON.stringify({
            to: messageCompose.to,
            subject: messageCompose.subject,
            message: messageCompose.message,
            attachment: messageCompose.attachment,
            customerId: messageCompose.customerId,
            workOrderId: messageCompose.workOrderId,
          }),
        });
      }

      setStatus(messageCompose.channel === "whatsapp" ? "WhatsApp enviado." : "Mail enviado.");
      setMessageCompose(null);
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }

      setMessageError(`No se pudo enviar el mensaje: ${getErrorMessage(error)}`);
    } finally {
      setMessageSending(false);
    }
  }

  if (!authChecked) {
    return <main className="loadingScreen">Preparando SSCC...</main>;
  }

  if (!user || authRedirecting) {
    return (
      <main className="loadingScreen">
        <span>Redirigiendo al login...</span>
        <a href="/login">Ingresar</a>
      </main>
    );
  }

  return (
    <>
    <main className={`shell ${mobileMenuOpen ? "menuOpen" : ""}`}>
      {mobileMenuOpen ? (
        <button
          type="button"
          className="mobileMenuBackdrop"
          aria-label="Cerrar menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}
      <aside className="sidebar" aria-label="Modulos">
        <div className="brand">
          <img className="brandLogo" src="/security-solutions-logo.png" alt="Security Solutions" />
          <div>
            <strong>Security Solutions</strong>
            <span>Control Center</span>
          </div>
        </div>
        <nav className="nav">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                type="button"
                key={module.name}
                className={module.name === activeModule ? "active" : ""}
                onClick={() => {
                  setActiveModule(module.name);
                  setMobileMenuOpen(false);
                }}
                title={module.name}
              >
                <Icon size={18} />
                <span>{module.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button
            type="button"
            className="mobileMenuButton"
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="topbarTitle">
            <p>{activeModule === "Dashboard" ? "Centro de Monitoreo" : "Gestion operativa"}</p>
            <h1>
              {activeModule === "Dashboard" ? "Security Solutions Control Center" : activeModule}
            </h1>
            {activeModule !== "Dashboard" ? <span className="connectionStatus">{status}</span> : null}
          </div>
          <div className="topbarRight">
            <span className="operatorName">{user.name}</span>
            <div className="topbarActions">
              <button
                type="button"
                title="Actualizar"
                aria-label="Actualizar"
                onClick={() =>
                  activeModule === "Clientes"
                    ? loadCustomers()
                    : activeModule === "Tercerizados"
                      ? loadCustomers()
                    : activeModule === "Trabajos"
                      ? loadWorkOrders()
                      : activeModule === "Agenda"
                        ? Promise.all([loadAgenda(), loadMeetings(token, null)])
                        : activeModule === "Despachador"
                          ? Promise.all([loadAgenda(), loadMeetings(token, null), loadVehicles()])
                        : activeModule === "Reuniones"
                          ? loadMeetings(token, null)
                          : activeModule === "Presupuestos"
                            ? loadQuotes()
                          : activeModule === "Cobros"
                            ? loadPayments()
                          : activeModule === "Almacen"
                            ? loadInventory()
                          : activeModule === "Equipos"
                            ? loadDevices()
                            : activeModule === "Vehiculos"
                              ? loadVehicles()
                              : activeModule === "Gmail"
                                ? syncGmail()
                                : activeModule === "WhatsApp"
                                  ? syncWhatsApp()
                              : loadSummary()
                }
              >
                <RefreshCw
                  size={20}
                  className={
                    loading ||
                    customersLoading ||
                    devicesLoading ||
                    workOrdersLoading ||
                    agendaLoading ||
                    meetingsLoading ||
                    quotesLoading ||
                    paymentsLoading ||
                    inventoryLoading ||
                    vehiclesLoading ||
                    gmailLoading ||
                    whatsAppLoading
                      ? "spin"
                      : ""
                  }
                />
              </button>
              <div className="notificationsMenu" ref={notificationsMenuRef}>
                <button
                  type="button"
                  title="Notificaciones"
                  aria-label="Notificaciones"
                  className={notifications.length ? "hasNotifications" : ""}
                  onClick={() => setNotificationsOpen((current) => !current)}
                >
                  <Bell size={20} />
                  {notifications.length ? (
                    <span className="notificationBadge">{criticalNotifications || notifications.length}</span>
                  ) : null}
                </button>
                {notificationsOpen ? (
                  <section className="notificationsPanel" aria-label="Notificaciones activas">
                    <div className="notificationsHeader">
                      <div>
                        <strong>Notificaciones</strong>
                        <span>{notifications.length ? `${notifications.length} alertas activas` : "Sin alertas activas"}</span>
                      </div>
                      <button type="button" aria-label="Cerrar notificaciones" onClick={() => setNotificationsOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="notificationsList">
                      {notifications.map((notification) => (
                        <article key={notification.id} className={`notificationItem ${notification.severity}`}>
                          <div>
                            <span>{notification.title}</span>
                            <strong>{notification.value}</strong>
                            <p>{notification.detail}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModule(notification.module);
                              setNotificationsOpen(false);
                            }}
                          >
                            Ver
                          </button>
                        </article>
                      ))}
                      {!notifications.length ? (
                        <p className="emptyNotifications">Todo al dia por ahora.</p>
                      ) : null}
                    </div>
                  </section>
                ) : null}
              </div>
              <button type="button" title="Cerrar sesion" aria-label="Cerrar sesion" onClick={logout}>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {activeModule === "Dashboard" ? (
          <DashboardView
            loading={loading}
            summary={summary}
            summaryCards={summaryCards}
            onRefresh={() => loadSummary()}
          />
        ) : activeModule === "Clientes" ? (
          <CustomersView
            mode="customers"
            customers={normalCustomers}
            customerError={customerError}
            customerForm={customerForm}
            customerProfile={customerProfile}
            customerProfileError={customerProfileError}
            customerProfileLoading={customerProfileLoading}
            customerSearch={customerSearch}
            customerStats={customerStats}
            customerStatus={customerStatus}
            editingCustomerId={editingCustomerId}
            locating={locating}
            loading={customersLoading}
            siteLocating={siteLocating}
            selectedCustomer={selectedCustomer?.type === "NORMAL" || !selectedCustomer?.type ? selectedCustomer : null}
            selectedCustomerId={selectedCustomer?.type === "NORMAL" || !selectedCustomer?.type ? selectedCustomerId : null}
            siteError={siteError}
            siteForm={siteForm}
            sites={selectedCustomer?.type === "NORMAL" || !selectedCustomer?.type ? sites : []}
            sitesLoading={sitesLoading}
            onCancelEdit={cancelCustomerEdit}
            onCloseProfile={() => {
              setCustomerProfile(null);
              setCustomerProfileError("");
            }}
            onEditCustomer={editCustomer}
            onFormChange={setCustomerForm}
            onLocate={captureCustomerLocation}
            onLocateSite={captureSiteLocation}
            onAddDocument={addCustomerDocument}
            onComposeMail={composeCustomerMail}
            onComposeWhatsApp={composeCustomerWhatsApp}
            onDeleteDocument={deleteCustomerDocument}
            onOpenProfile={openCustomerProfile}
            onOpenDocument={openCustomerDocumentModal}
            onOpenDeviceGroup={openDeviceGroupFromCustomerProfile}
            onOpenWorkOrder={openWorkOrderFromCustomerProfile}
            onRefresh={() => loadCustomers()}
            onSave={saveCustomer}
            onSearchChange={setCustomerSearch}
            onSelectCustomer={selectCustomer}
            onSiteFormChange={setSiteForm}
            onSiteRefresh={() => loadSites()}
            onSiteSave={saveSite}
            onStatusChange={setCustomerStatus}
          />
        ) : activeModule === "Tercerizados" ? (
          <CustomersView
            mode="thirdParty"
            customers={thirdPartyCustomers}
            customerError={customerError}
            customerForm={customerForm}
            customerProfile={customerProfile}
            customerProfileError={customerProfileError}
            customerProfileLoading={customerProfileLoading}
            customerSearch={customerSearch}
            customerStats={thirdPartyStats}
            customerStatus={customerStatus}
            editingCustomerId={editingCustomerId}
            locating={locating}
            loading={customersLoading}
            siteLocating={siteLocating}
            selectedCustomer={selectedCustomer?.type === "THIRD_PARTY" ? selectedCustomer : null}
            selectedCustomerId={selectedCustomer?.type === "THIRD_PARTY" ? selectedCustomerId : null}
            siteError={siteError}
            siteForm={siteForm}
            sites={selectedCustomer?.type === "THIRD_PARTY" ? sites : []}
            sitesLoading={sitesLoading}
            onCancelEdit={cancelCustomerEdit}
            onCloseProfile={() => {
              setCustomerProfile(null);
              setCustomerProfileError("");
            }}
            onEditCustomer={editCustomer}
            onFormChange={setCustomerForm}
            onLocate={captureCustomerLocation}
            onLocateSite={captureSiteLocation}
            onAddDocument={addCustomerDocument}
            onComposeMail={composeCustomerMail}
            onComposeWhatsApp={composeCustomerWhatsApp}
            onDeleteDocument={deleteCustomerDocument}
            onOpenProfile={openCustomerProfile}
            onOpenDocument={openCustomerDocumentModal}
            onOpenDeviceGroup={openDeviceGroupFromCustomerProfile}
            onOpenWorkOrder={openWorkOrderFromCustomerProfile}
            onRefresh={() => loadCustomers()}
            onSave={saveCustomer}
            onSearchChange={setCustomerSearch}
            onSelectCustomer={selectCustomer}
            onSiteFormChange={setSiteForm}
            onSiteRefresh={() => loadSites()}
            onSiteSave={saveSite}
            onStatusChange={setCustomerStatus}
          />
        ) : activeModule === "Trabajos" ? (
          <WorkOrdersView
            editingWorkOrderId={editingWorkOrderId}
            customers={customers}
            inventoryItems={inventoryItems}
            loading={workOrdersLoading}
            selectedCustomerId={selectedCustomerId}
            sites={sites}
            workOrderError={workOrderError}
            workOrderForm={workOrderForm}
            workOrderStats={workOrderStats}
            workOrders={workOrders}
            workSearch={workSearch}
            workStatus={workStatus}
            focusedWorkOrderId={focusedWorkOrderId}
            onAddMaterial={addWorkOrderMaterial}
            onCancelEdit={cancelWorkOrderEdit}
            onEditWorkOrder={editWorkOrder}
            onFormChange={setWorkOrderForm}
            onRefresh={() => loadWorkOrders()}
            onRemoveMaterial={removeWorkOrderMaterial}
            onSave={saveWorkOrder}
            onSearchChange={setWorkSearch}
            onSelectCustomer={selectCustomer}
            onComposeMail={composeWorkOrderMail}
            onComposeWhatsApp={composeWorkOrderWhatsApp}
            onOpenDocument={setWorkOrderDocument}
            onStatusChange={setWorkStatus}
            onUpdateStatus={updateWorkOrderStatus}
          />
        ) : activeModule === "Agenda" ? (
          <AgendaView
            agendaDate={agendaDate}
            agendaError={agendaError}
            agendaMeetingsOverdue={agendaMeetingsOverdue}
            agendaMeetingsToday={agendaMeetingsToday}
            agendaMeetingsWeek={agendaMeetingsWeek}
            agendaOverdue={agendaOverdue}
            agendaStats={agendaStats}
            agendaStatus={agendaStatus}
            agendaToday={agendaToday}
            agendaWeek={agendaWeek}
            loading={agendaLoading}
            selectedDate={selectedAgendaDate}
            onDateChange={setAgendaDate}
            onRefresh={() => {
              void Promise.all([loadAgenda(), loadMeetings(token, null)]);
            }}
            onStatusChange={setAgendaStatus}
            onUpdateMeetingStatus={updateMeetingStatus}
            onUpdateStatus={updateWorkOrderStatus}
          />
        ) : activeModule === "Despachador" ? (
          <DispatcherView
            agendaDate={agendaDate}
            loading={agendaLoading}
            selectedDate={selectedAgendaDate}
            token={token}
            vehicles={vehicles}
            workOrders={agendaToday}
            onDateChange={setAgendaDate}
            onRefresh={() => {
              void Promise.all([loadAgenda(), loadMeetings(token, null), loadVehicles()]);
            }}
          />
        ) : activeModule === "Reuniones" ? (
          <MeetingsView
            customers={customers}
            editingMeetingId={editingMeetingId}
            loading={meetingsLoading}
            meetingError={meetingError}
            meetingForm={meetingForm}
            meetingSearch={meetingSearch}
            meetingStats={meetingStats}
            meetingStatus={meetingStatus}
            meetingType={meetingType}
            meetings={meetings}
            selectedCustomerId={selectedCustomerId}
            onCancelEdit={cancelMeetingEdit}
            onEditMeeting={editMeeting}
            onFormChange={setMeetingForm}
            onRefresh={() => loadMeetings(token, null)}
            onSave={saveMeeting}
            onSearchChange={setMeetingSearch}
            onSelectCustomer={selectCustomer}
            onStatusChange={setMeetingStatus}
            onTypeChange={setMeetingType}
            onUpdateStatus={updateMeetingStatus}
          />
        ) : activeModule === "Presupuestos" ? (
          <QuotesView
            customers={customers}
            editingQuoteId={editingQuoteId}
            loading={quotesLoading}
            quoteError={quoteError}
            quoteForm={quoteForm}
            quoteLaborPreview={quoteLaborPreview}
            inventoryItems={inventoryItems}
            priceBookItems={priceBookItems}
            quoteSearch={quoteSearch}
            quoteStats={quoteStats}
            quoteStatus={quoteStatus}
            quotes={quotes}
            onAccept={acceptQuote}
            onCancelEdit={cancelQuoteEdit}
            onComposeMail={composeQuoteMail}
            onComposeWhatsApp={composeQuoteWhatsApp}
            onEditQuote={editQuote}
            onFormChange={setQuoteForm}
            onRefresh={() => loadQuotes()}
            onSave={saveQuote}
            onSearchChange={setQuoteSearch}
            onSelectCustomer={selectCustomer}
            onStatusChange={setQuoteStatus}
          />
        ) : activeModule === "Cobros" ? (
          <PaymentsView
            customers={customers}
            loading={paymentsLoading}
            paymentError={paymentError}
            paymentForm={paymentForm}
            paymentSearch={paymentSearch}
            paymentStats={paymentStats}
            paymentStatus={paymentStatus}
            payments={payments}
            selectedCustomerId={selectedCustomerId}
            onFormChange={setPaymentForm}
            onMarkPaid={markPaymentPaid}
            onRefresh={() => loadPayments()}
            onSave={savePayment}
            onSearchChange={setPaymentSearch}
            onSelectCustomer={selectCustomer}
            onStatusChange={setPaymentStatus}
          />
        ) : activeModule === "Almacen" ? (
          <InventoryView
            devices={devices}
            editingInventoryItemId={editingInventoryItemId}
            inventoryCategory={inventoryCategory}
            inventoryCatalogMatches={inventoryCatalogMatches}
            inventoryError={inventoryError}
            inventoryForm={inventoryForm}
            inventoryItems={visibleInventoryItems}
            inventoryMode={inventoryMode}
            inventoryMovementForm={inventoryMovementForm}
            inventorySearch={inventorySearch}
            inventoryStats={inventoryStats}
            inventoryStockFilter={inventoryStockFilter}
            inventorySupplier={inventorySupplier}
            loading={inventoryLoading}
            workOrders={workOrders}
            onCancelEdit={cancelInventoryEdit}
            onEditItem={editInventoryItem}
            onDeleteItem={deleteInventoryItem}
            onDeleteMovement={deleteInventoryMovement}
            onFormChange={setInventoryForm}
            onQuickMovement={quickInventoryMovement}
            onMovementFormChange={setInventoryMovementForm}
            onMovementSave={saveInventoryMovement}
            onRefresh={() => loadInventory()}
            onSave={saveInventoryItem}
            onSearchChange={setInventorySearch}
            onCategoryChange={setInventoryCategory}
            onModeChange={setInventoryMode}
            onStockFilterChange={setInventoryStockFilter}
            onSupplierChange={setInventorySupplier}
          />
        ) : activeModule === "Vehiculos" ? (
          <VehiclesView
            loading={vehiclesLoading}
            token={token}
            vehicleError={vehicleError}
            vehicleForm={vehicleForm}
            vehicleSearch={vehicleSearch}
            vehicleStats={vehicleStats}
            vehicleStatus={vehicleStatus}
            vehicles={vehicles}
            onFormChange={setVehicleForm}
            onRefresh={() => loadVehicles()}
            onSave={saveVehicle}
            onSearchChange={setVehicleSearch}
            onStatusChange={setVehicleStatus}
            onDelete={deleteVehicle}
            onToggleActive={toggleVehicleActive}
          />
        ) : activeModule === "Gmail" ? (
          <GmailView
            gmailError={gmailError}
            gmailStats={gmailStats}
            loading={gmailLoading}
            status={gmailStatus}
            sync={gmailSync}
            onRefresh={() => syncGmail()}
          />
        ) : activeModule === "WhatsApp" ? (
          <WhatsAppView
            customers={customers}
            loading={whatsAppLoading}
            status={whatsAppStatus}
            sync={whatsAppSync}
            dailySummary={whatsAppDailySummary}
            dailySummaryForm={whatsAppDailySummaryForm}
            whatsAppError={whatsAppError}
            whatsAppStats={whatsAppStats}
            savingSummary={whatsAppSummarySaving}
            onDailySummaryChange={setWhatsAppDailySummaryForm}
            onSaveDailySummary={saveWhatsAppDailySummary}
            onSendDailySummary={sendWhatsAppDailySummaryNow}
            onRefresh={() => syncWhatsApp()}
            onReply={composeWhatsAppChat}
          />
        ) : (
          <DevicesView
            customers={customers}
            deviceError={deviceError}
            deviceForm={deviceForm}
            focusedDeviceGroupKey={focusedDeviceGroupKey}
            deviceSearch={deviceSearch}
            deviceStats={deviceStats}
            deviceType={deviceType}
            devices={devices}
            loading={devicesLoading}
            selectedCustomerId={selectedCustomerId}
            sites={sites}
            onDeviceFormChange={setDeviceForm}
            onDuplicateDevice={duplicateDevice}
            onRefresh={() => loadDevices()}
            onSave={saveDevice}
            onSearchChange={setDeviceSearch}
            onSelectCustomer={selectCustomer}
            onTypeChange={setDeviceType}
          />
        )}
      </section>
    </main>
    {workOrderDocument ? (
      <WorkOrderDocumentModal
        workOrder={workOrderDocument}
        onClose={() => setWorkOrderDocument(null)}
        onMail={composeWorkOrderMail}
        onPrint={printWorkOrderDocument}
        onWhatsApp={composeWorkOrderWhatsApp}
      />
    ) : null}
    {customerDocumentView && typeof document !== "undefined" ? createPortal(
      <CustomerDocumentModal
        customer={customerDocumentView.customer}
        document={customerDocumentView.document}
        onClose={() => setCustomerDocumentView(null)}
        onDelete={(document) => deleteCustomerDocument(customerDocumentView.customer.id, document.id)}
        onMail={(customer, document) => composeCustomerDocumentMail(customer, document)}
        onPrint={printCustomerDocument}
        onWhatsApp={(customer, document) => composeCustomerDocumentWhatsApp(customer, document)}
      />,
      document.body,
    ) : null}
    {messageCompose && typeof document !== "undefined" ? createPortal(
      <MessageComposeModal
        compose={messageCompose}
        error={messageError}
        loading={messageSending}
        recipientOptions={messageRecipientOptions}
        onChange={setMessageCompose}
        onClose={() => {
          setMessageCompose(null);
          setMessageError("");
        }}
        onSend={sendComposedMessage}
      />,
      document.body,
    ) : null}
    </>
  );
}

function MessageComposeModal({
  compose,
  error,
  loading,
  recipientOptions,
  onChange,
  onClose,
  onSend,
}: {
  compose: MessageComposeState;
  error: string;
  loading: boolean;
  recipientOptions: MessageRecipientOption[];
  onChange: (compose: MessageComposeState) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  const channelLabel = compose.channel === "whatsapp" ? "WhatsApp" : "Mail";
  const destinationLabel = compose.channel === "whatsapp" ? "Telefono" : "Email";
  const selectedRecipientValue = recipientOptions.some((option) => option.value === compose.to) ? compose.to : "";
  const [manualRecipient, setManualRecipient] = useState(!selectedRecipientValue && Boolean(compose.to));

  return (
    <div className="deviceDetailOverlay customerProfileOverlay" onClick={onClose}>
      <section
        className="customerProfileModal messageComposeModal"
        aria-label={`Enviar ${channelLabel}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="deviceDetailHeader">
          <div>
            <span>{channelLabel}</span>
            <h2>{compose.title}</h2>
            <p>{compose.attachment ? "Edita el mensaje; la plantilla se enviara adjunta." : "Edita el mensaje antes de enviarlo desde el CRM."}</p>
          </div>
          <div className="documentToolbarActions">
            <button type="button" className="secondaryButton" onClick={onSend} disabled={loading || !compose.to || !compose.message.trim()}>
              {compose.channel === "whatsapp" ? <MessageSquare size={16} /> : <Mail size={16} />}
              {loading ? "Enviando..." : "Enviar"}
            </button>
            <button type="button" className="iconButton" onClick={onClose} aria-label="Cerrar mensaje">
              <X size={18} />
            </button>
          </div>
        </header>

        {error ? <p className="formError">{error}</p> : null}

        <div className="messageComposeGrid">
          {compose.attachment ? (
            <div className="messageAttachmentPreview wideField">
              <Paperclip size={17} />
              <div>
                <strong>{compose.attachment.name}</strong>
                <span>Plantilla de presupuesto adjunta</span>
              </div>
            </div>
          ) : null}
          <label>
            Enviar a
            <select
              value={selectedRecipientValue}
              onChange={(event) => {
                const option = recipientOptions.find((item) => item.value === event.target.value);
                setManualRecipient(false);
                onChange({
                  ...compose,
                  to: event.target.value,
                  title: option ? `${channelLabel} - ${option.label}` : compose.title,
                });
              }}
            >
              <option value="">Seleccionar contacto</option>
              {recipientOptions.map((option) => (
                <option key={`${option.value}-${option.label}`} value={option.value}>
                  {option.label}{option.detail ? ` - ${option.detail}` : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="manualRecipientPanel">
            {manualRecipient ? (
              <label>
                {destinationLabel}
                <input
                  value={compose.to}
                  onChange={(event) => onChange({ ...compose, to: event.target.value })}
                  placeholder={compose.channel === "whatsapp" ? "099 000 000" : "cliente@empresa.com"}
                />
              </label>
            ) : (
              <button type="button" className="secondaryButton" onClick={() => setManualRecipient(true)}>
                Escribir manual
              </button>
            )}
          </div>
          {compose.channel === "mail" ? (
            <label>
              Asunto
              <input
                value={compose.subject}
                onChange={(event) => onChange({ ...compose, subject: event.target.value })}
                placeholder="Asunto del correo"
              />
            </label>
          ) : null}
          <label className="wideField">
            Mensaje
            <textarea
              value={compose.message}
              onChange={(event) => onChange({ ...compose, message: event.target.value })}
              placeholder="Escribe el mensaje"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

function WorkOrderDocumentModal({
  workOrder,
  onClose,
  onMail,
  onPrint,
  onWhatsApp,
}: {
  workOrder: WorkOrder;
  onClose: () => void;
  onMail: (workOrder: WorkOrder) => void;
  onPrint: () => void;
  onWhatsApp: (workOrder: WorkOrder) => void;
}) {
  const movements = groupWorkOrderMaterials(workOrder.inventoryMovements ?? []);
  const documentNumber = formatWorkOrderNumber(workOrder);
  const reportPhotos = workOrder.reportPhotos ?? [];
  const beforePhotos = reportPhotos.filter((photo) => photo.stage === "BEFORE");
  const afterPhotos = reportPhotos.filter((photo) => photo.stage === "AFTER");
  const hasTechnicalReport = Boolean(
    workOrder.reportBeforeNotes ||
      workOrder.reportAfterNotes ||
      workOrder.reportTasks ||
      workOrder.reportTests ||
      workOrder.reportRecommendations ||
      reportPhotos.length,
  );

  return (
    <div className="documentOverlay">
      <div className="documentToolbar">
        <div>
          <strong>Orden de trabajo {documentNumber}</strong>
          <span>{workOrder.customer.name}</span>
        </div>
        <div className="documentToolbarActions">
          <button type="button" className="secondaryButton" onClick={onPrint}>
            <Printer size={16} />
            PDF / Imprimir
          </button>
          <button type="button" className="secondaryButton" onClick={() => onWhatsApp(workOrder)}>
            <MessageSquare size={16} />
            WhatsApp
          </button>
          <button type="button" className="secondaryButton" onClick={() => onMail(workOrder)}>
            <Mail size={16} />
            Mail
          </button>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Cerrar orden">
            <X size={18} />
          </button>
        </div>
      </div>

      <section className="workOrderDocumentSheet printableWorkOrder">
        <header className="documentHeader">
          <div className="documentIdentityBlock">
            <img src="/security-solutions-logo.png" alt="Security Solutions" />
            <strong>Security Solutions</strong>
            <span>Proveedor de servicios</span>
          </div>
          <div className="documentCenterTitle">
            <span>Orden de trabajo</span>
            <strong>{documentNumber}</strong>
            <small>{formatDateTime(workOrder.completedAt ?? workOrder.updatedAt)}</small>
          </div>
          <div className="documentIdentityBlock documentClientIdentity">
            <div className="documentClientLogo">
              {workOrder.customer.logoUrl ? (
                <img src={workOrder.customer.logoUrl} alt={`Logo ${workOrder.customer.name}`} />
              ) : (
                <strong>{workOrder.customer.name.slice(0, 2).toUpperCase()}</strong>
              )}
            </div>
            <strong>{workOrder.customer.name}</strong>
            <span>Cliente</span>
          </div>
        </header>

        <div className="documentTitleBlock">
          <div>
            <span>{deviceTypeLabels[workOrder.type]}</span>
            <h1>{workOrder.title}</h1>
          </div>
          <em>{workStatusLabels[workOrder.status]}</em>
        </div>

        <section className="documentInfoGrid">
          <article>
            <span>Cliente</span>
            <strong>{workOrder.customer.name}</strong>
            {workOrder.customer.reference ? <p>{workOrder.customer.reference}</p> : null}
            {workOrder.customer.taxId ? <p>RUT / Documento: {workOrder.customer.taxId}</p> : null}
            <p>{workOrder.customer.phone || "Telefono no cargado"}</p>
            <p>{workOrder.customer.email || "Email no cargado"}</p>
          </article>
          <article>
            <span>Sitio</span>
            <strong>{workOrder.site?.name ?? "Sin sitio especifico"}</strong>
            <p>{workOrder.site?.address ?? "Direccion no cargada"}</p>
          </article>
          <article>
            <span>Agenda</span>
            <strong>{formatDateTime(workOrder.scheduledAt)}</strong>
            <p>Finalizado: {formatDateTime(workOrder.completedAt ?? workOrder.updatedAt)}</p>
          </article>
        </section>

        <section className="documentSection">
          <h2>Trabajo realizado</h2>
          <p>{workOrder.notes || "Trabajo finalizado segun lo solicitado por el cliente."}</p>
        </section>

        <section className="documentSection documentMaterialsSection">
          <h2>Materiales y equipos instalados</h2>
          <div className="documentTableWrap">
            <table className="documentTable">
              <thead>
                <tr>
                  <th>Articulo</th>
                  <th>SKU</th>
                  <th>Cant.</th>
                  <th>Equipo / serie</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.key}>
                    <td>{movement.name}</td>
                    <td>{movement.sku || "-"}</td>
                    <td>
                      {movement.quantity} {movement.unit}
                    </td>
                    <td>{movement.deviceDetails.length ? movement.deviceDetails.join(" / ") : "-"}</td>
                  </tr>
                ))}
                {!movements.length ? (
                  <tr>
                    <td colSpan={4}>Sin materiales cargados en esta orden.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {hasTechnicalReport ? (
          <section className="documentSection documentTechnicalReport">
            <h2>Informe tecnico</h2>
            <div className="documentInfoGrid">
              {workOrder.reportBeforeNotes ? (
                <article>
                  <span>Antes</span>
                  <p>{workOrder.reportBeforeNotes}</p>
                </article>
              ) : null}
              {workOrder.reportTasks ? (
                <article>
                  <span>Trabajo realizado</span>
                  <p>{workOrder.reportTasks}</p>
                </article>
              ) : null}
              {workOrder.reportAfterNotes ? (
                <article>
                  <span>Despues</span>
                  <p>{workOrder.reportAfterNotes}</p>
                </article>
              ) : null}
              {workOrder.reportTests ? (
                <article>
                  <span>Pruebas</span>
                  <p>{workOrder.reportTests}</p>
                </article>
              ) : null}
              {workOrder.reportRecommendations ? (
                <article>
                  <span>Recomendaciones</span>
                  <p>{workOrder.reportRecommendations}</p>
                </article>
              ) : null}
            </div>
            <div className="documentReportPhotos">
              <ReportPhotoPreview title="Antes" photos={beforePhotos} />
              <ReportPhotoPreview title="Despues" photos={afterPhotos} />
            </div>
          </section>
        ) : null}

        <section className="documentSignatures">
          <div>
            <span>Firma tecnico</span>
          </div>
          <div>
            <span>Firma cliente</span>
          </div>
          <div>
            <span>Aclaracion / CI</span>
          </div>
        </section>

        <footer className="documentFooter">
          <span>Security Solutions Control Center</span>
          <span>seguridadsoluciones2024@gmail.com</span>
        </footer>
      </section>
    </div>
  );
}

function CustomerDocumentModal({
  customer,
  document,
  onClose,
  onDelete,
  onMail,
  onPrint,
  onWhatsApp,
}: {
  customer: Customer;
  document: CustomerDocument;
  onClose: () => void;
  onDelete: (document: CustomerDocument) => Promise<void>;
  onMail: (customer: Customer, document: CustomerDocument) => void;
  onPrint: (document: CustomerDocument) => void;
  onWhatsApp: (customer: Customer, document: CustomerDocument) => void;
}) {
  const target = document.dataUrl || document.url || "";
  const mimeType = document.mimeType || document.type || "";
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType.includes("pdf");
  const previewTarget = isPdf && target
    ? `${target}${target.includes("#") ? "&" : "#"}toolbar=0&navpanes=0&scrollbar=1&view=FitH`
    : target;

  return (
    <div className="documentOverlay customerDocumentOverlay" onClick={onClose}>
      <section
        className="customerDocumentModal"
        aria-label={`Documento ${document.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="customerDocumentModalHeader">
          <div className="customerDocumentTitle">
            <span>Documento de cliente</span>
            <strong>{document.name}</strong>
            <small>
              {customer.reference} - {customer.name} - {mimeType || "Documento"} - {formatDateTime(document.createdAt)}
            </small>
          </div>
          <div className="customerDocumentActions" aria-label="Acciones del documento">
            <button type="button" onClick={() => onPrint(document)}>
              <Printer size={17} />
              Imprimir
            </button>
            <button type="button" onClick={() => onWhatsApp(customer, document)}>
              <MessageSquare size={17} />
              WhatsApp
            </button>
            <button type="button" onClick={() => onMail(customer, document)}>
              <Mail size={17} />
              Mail
            </button>
            <button type="button" className="dangerButton" onClick={() => void onDelete(document)}>
              <X size={17} />
              Eliminar
            </button>
            <button type="button" onClick={onClose}>
              <X size={17} />
              Cerrar
            </button>
          </div>
        </header>
        <section className="customerDocumentViewer">
          <div className="customerDocumentPreview">
            {!target ? <p>Este documento no tiene archivo asociado.</p> : null}
            {target && isImage ? <img src={previewTarget} alt={document.name} /> : null}
            {target && isPdf ? <iframe src={previewTarget} title={document.name} /> : null}
            {target && !isImage && !isPdf ? (
              <div className="emptyPanel">
                <p>Vista previa no disponible para este tipo de archivo.</p>
                <a href={previewTarget} target="_blank" rel="noreferrer">Abrir documento</a>
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </div>
  );
}

function AddressDisplay({ value, fallback = "Sin direccion" }: { value?: string | null; fallback?: string }) {
  const address = formatAddressParts(value);

  if (!address.primary) {
    return <span className="compactAddress">{fallback}</span>;
  }

  return (
    <span className="compactAddress">
      <strong>{address.primary}</strong>
      {address.secondary ? <small>{address.secondary}</small> : null}
    </span>
  );
}

type GeoZoneTarget = {
  name?: string | null;
  address?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  traccarGeofenceId?: number | null;
};

function GeoZoneButton({ target, compact = false }: { target: GeoZoneTarget; compact?: boolean }) {
  const geo = getGeoZoneInfo(target);

  return (
    <button
      type="button"
      className={`geoZoneButton ${geo.active ? "active" : "inactive"} ${compact ? "compact" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        if (geo.mapUrl) {
          window.open(geo.mapUrl, "_blank", "noopener,noreferrer");
        }
      }}
      disabled={!geo.mapUrl}
      title={geo.mapUrl ? "Abrir ubicacion en Google Maps" : "Carga coordenadas o direccion para abrir Maps"}
    >
      <MapPin size={compact ? 14 : 16} />
      <span>{geo.active ? "Geozona activa" : "Geozona desactivada"}</span>
      {geo.synced ? <small>Traccar</small> : null}
    </button>
  );
}

function DashboardView({
  loading,
  summary,
  summaryCards,
  onRefresh,
}: {
  loading: boolean;
  summary: DashboardSummary;
  summaryCards: Array<{ label: string; value: number | string; detail?: string }>;
  onRefresh: () => void;
}) {
  return (
    <>
      <section className="summaryGrid" aria-label="Indicadores principales">
        {summaryCards.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            {card.detail ? <small>{card.detail}</small> : null}
          </article>
        ))}
      </section>

      <section className="monitor">
        <div className="sectionHeader">
          <div>
            <p>Centro operativo</p>
            <h2>Operacion en vivo</h2>
          </div>
          <button type="button" onClick={onRefresh}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Actualizar
          </button>
        </div>
        <div className="monitorGrid">
          {summary.monitoringItems.map((item) => (
            <article key={item.label} className="monitorCard">
              <span>{item.label}</span>
              <strong>{formatDashboardValue(item)}</strong>
              <p>{item.detail ?? "Dato conectado al sistema"}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function formatDashboardValue(item: { label: string; value: number | string }) {
  if (
    typeof item.value === "number" &&
    (item.label.toLowerCase().includes("monto") || item.label.toLowerCase().includes("pipeline"))
  ) {
    return formatCurrency(item.value);
  }

  return item.value;
}

function sortWorkOrdersByDate(workOrders: WorkOrder[]) {
  return [...workOrders].sort((left, right) => {
    const leftTime = new Date(left.completedAt ?? left.scheduledAt ?? left.updatedAt ?? left.createdAt).getTime();
    const rightTime = new Date(right.completedAt ?? right.scheduledAt ?? right.updatedAt ?? right.createdAt).getTime();
    return rightTime - leftTime;
  });
}

function CustomersView({
  mode = "customers",
  customers,
  customerError,
  customerForm,
  customerProfile,
  customerProfileError,
  customerProfileLoading,
  customerSearch,
  customerStats,
  customerStatus,
  editingCustomerId,
  locating,
  loading,
  siteLocating,
  selectedCustomer,
  selectedCustomerId,
  siteError,
  siteForm,
  sites,
  sitesLoading,
  onCancelEdit,
  onCloseProfile,
  onEditCustomer,
  onFormChange,
  onLocate,
  onLocateSite,
  onAddDocument,
  onComposeMail,
  onComposeWhatsApp,
  onDeleteDocument,
  onOpenDocument,
  onOpenProfile,
  onOpenDeviceGroup,
  onOpenWorkOrder,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onSiteFormChange,
  onSiteRefresh,
  onSiteSave,
  onStatusChange,
}: {
  mode?: "customers" | "thirdParty";
  customers: Customer[];
  customerError: string;
  customerForm: CustomerPayload;
  customerProfile: CustomerProfile | null;
  customerProfileError: string;
  customerProfileLoading: boolean;
  customerSearch: string;
  customerStats: Array<{ label: string; value: number }>;
  customerStatus: CustomerStatus | "ALL";
  editingCustomerId: string | null;
  locating: boolean;
  loading: boolean;
  siteLocating: boolean;
  selectedCustomer: Customer | null;
  selectedCustomerId: string | null;
  siteError: string;
  siteForm: SitePayload;
  sites: CustomerSite[];
  sitesLoading: boolean;
  onCancelEdit: () => void;
  onCloseProfile: () => void;
  onEditCustomer: (customer: Customer) => void;
  onFormChange: (form: CustomerPayload) => void;
  onLocate: () => void;
  onLocateSite: () => void;
  onAddDocument: (customerId: string, payload: CustomerDocumentPayload) => Promise<void>;
  onComposeMail: (customer: Customer) => void;
  onComposeWhatsApp: (customer: Customer) => void;
  onDeleteDocument: (customerId: string, documentId: string) => Promise<void>;
  onOpenDocument: (customer: Customer, document: CustomerDocument) => void;
  onOpenProfile: (customer: Customer) => void;
  onOpenDeviceGroup: (group: GroupedInstalledDevice) => void;
  onOpenWorkOrder: (workOrder: WorkOrder) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onSiteFormChange: (form: SitePayload) => void;
  onSiteRefresh: () => void;
  onSiteSave: (event: FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: CustomerStatus | "ALL") => void;
}) {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const copy =
    mode === "thirdParty"
      ? {
          summaryLabel: "Resumen de tercerizados",
          formEyebrowCreate: "Nueva empresa",
          formEyebrowEdit: "Actualizar acuerdo",
          formTitleCreate: "Alta tercerizado",
          formTitleEdit: "Editar tercerizado",
          nameLabel: "Empresa tercerizada",
          namePlaceholder: "Segura, empresa asociada",
          legalLabel: "Razon social",
          notesPlaceholder: "Tarifas pactadas, condiciones de pago, contactos y forma de trabajo",
          searchPlaceholder: "Buscar por empresa, RUT, contacto, email o telefono",
          tableName: "Empresa",
          sitesTitle: "Puntos de servicio",
          selectedTitle: "Selecciona un tercerizado",
          emptyList: "No hay tercerizados para los filtros actuales.",
          emptySites: "Este tercerizado todavia no tiene puntos de servicio cargados.",
          submitCreate: "Crear tercerizado",
        }
      : {
          summaryLabel: "Resumen de clientes",
          formEyebrowCreate: "Nuevo cliente",
          formEyebrowEdit: "Actualizar ficha",
          formTitleCreate: "Alta rapida",
          formTitleEdit: "Editar cliente",
          nameLabel: "Nombre comercial",
          namePlaceholder: "Cliente o contacto principal",
          legalLabel: "Razon social",
          notesPlaceholder: "Observaciones operativas, horarios, contactos, preferencias",
          searchPlaceholder: "Buscar por referencia, nombre, RUT, email o telefono",
          tableName: "Cliente",
          sitesTitle: "Sitios del cliente",
          selectedTitle: "Selecciona un cliente",
          emptyList: "No hay clientes para los filtros actuales.",
          emptySites: "Este cliente todavia no tiene sitios cargados.",
          submitCreate: "Crear cliente",
        };

  function selectLogoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "image/png") {
      window.alert("Selecciona un archivo PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      window.alert("El logo PNG no puede superar los 4 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onFormChange({ ...customerForm, logoUrl: reader.result });
      }
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="customersModule">
      <div className="summaryGrid customerStats" aria-label={copy.summaryLabel}>
        {customerStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="customerLayout">
        <form className="customerForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>{editingCustomerId ? copy.formEyebrowEdit : copy.formEyebrowCreate}</p>
              <h2>{editingCustomerId ? copy.formTitleEdit : copy.formTitleCreate}</h2>
            </div>
            {editingCustomerId ? (
              <button type="button" className="secondaryButton" onClick={onCancelEdit}>
                <X size={17} />
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="formGrid">
            <label>
              {copy.nameLabel}
              <input
                value={customerForm.name}
                onChange={(event) => onFormChange({ ...customerForm, name: event.target.value })}
                placeholder={copy.namePlaceholder}
              />
            </label>
            <label>
              {copy.legalLabel}
              <input
                value={customerForm.legalName}
                onChange={(event) => onFormChange({ ...customerForm, legalName: event.target.value })}
                placeholder="Empresa legal"
              />
            </label>
            <label>
              RUT / Documento
              <input
                value={customerForm.taxId}
                onChange={(event) => onFormChange({ ...customerForm, taxId: event.target.value })}
                placeholder="Identificador fiscal"
              />
            </label>
            <label>
              Estado
              <select
                value={customerForm.status}
                onChange={(event) =>
                  onFormChange({ ...customerForm, status: event.target.value as CustomerStatus })
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Email
              <input
                type="email"
                value={customerForm.email}
                onChange={(event) => onFormChange({ ...customerForm, email: event.target.value })}
                placeholder="correo@empresa.com"
              />
            </label>
            <label>
              Telefono
              <input
                value={customerForm.phone}
                onChange={(event) => onFormChange({ ...customerForm, phone: event.target.value })}
                placeholder="099 000 000"
              />
            </label>
            <label className="wideField">
              <span className="fieldLabelRow">
                Direccion
                <button type="button" className="geoButton" onClick={onLocate} disabled={locating}>
                  <MapPin size={16} />
                  {locating ? "Ubicando" : "Usar ubicacion"}
                </button>
              </span>
              <input
                value={customerForm.address}
                onChange={(event) => onFormChange(applyCoordinatesFromText({ ...customerForm, address: event.target.value }))}
                placeholder="Direccion principal, coordenadas o link de Google Maps"
              />
            </label>
            <label>
              Latitud
              <input
                type="number"
                step="0.000001"
                value={customerForm.latitude ?? ""}
                onChange={(event) =>
                  onFormChange({
                    ...customerForm,
                    latitude: event.target.value === "" ? undefined : Number(event.target.value),
                  })
                }
                placeholder="-34.901112"
              />
            </label>
            <label>
              Longitud
              <input
                type="number"
                step="0.000001"
                value={customerForm.longitude ?? ""}
                onChange={(event) =>
                  onFormChange({
                    ...customerForm,
                    longitude: event.target.value === "" ? undefined : Number(event.target.value),
                  })
                }
                placeholder="-56.164532"
              />
            </label>
            <div className="geoStatus wideField">
              <MapPin size={16} />
              <span>{buildGeoStatusText(customerForm.latitude, customerForm.longitude, "Sin coordenadas: no entrara en rutas automaticas hasta cargar GPS.")}</span>
            </div>
            <label className="wideField">
              <span className="fieldLabelRow">
                Logo PNG
                <button type="button" className="geoButton" onClick={() => logoInputRef.current?.click()}>
                  <FileText size={16} />
                  Seleccionar
                </button>
              </span>
              <div className="logoPickerRow">
                <input
                  value={customerForm.logoUrl}
                  onChange={(event) => onFormChange({ ...customerForm, logoUrl: event.target.value })}
                  placeholder="/logos/cliente.png o https://..."
                />
                {customerForm.logoUrl ? (
                  <button type="button" className="secondaryButton" onClick={() => onFormChange({ ...customerForm, logoUrl: "" })}>
                    Quitar
                  </button>
                ) : null}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png"
                className="hiddenFileInput"
                onChange={selectLogoFile}
              />
              {customerForm.logoUrl ? (
                <div className="customerLogoPreview">
                  <img src={customerForm.logoUrl} alt="Vista previa del logo" />
                </div>
              ) : null}
            </label>
            <label className="wideField">
              Notas
              <textarea
                value={customerForm.notes}
                onChange={(event) => onFormChange({ ...customerForm, notes: event.target.value })}
                placeholder={copy.notesPlaceholder}
              />
            </label>
          </div>

          {customerError ? <p className="formError">{customerError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            {editingCustomerId ? <Save size={18} /> : <Plus size={18} />}
            {editingCustomerId ? "Guardar cambios" : copy.submitCreate}
          </button>
        </form>

        <section className="customerDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={customerSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={copy.searchPlaceholder}
              />
            </label>
            <select
              value={customerStatus}
              onChange={(event) => onStatusChange(event.target.value as CustomerStatus | "ALL")}
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="customerTableWrap">
            <table className="customerTable">
              <thead>
                <tr>
                  <th>{copy.tableName}</th>
                  <th>Contacto</th>
                  <th className="centerColumn">Estado</th>
                  <th className="centerColumn">Geozona</th>
                  <th className="centerColumn">Sitios</th>
                  <th className="centerColumn">Trabajos</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={customer.id === selectedCustomerId ? "selectedRow" : ""}
                    onClick={() => onOpenProfile(customer)}
                  >
                    <td data-label={copy.tableName}>
                      <strong>{customer.name}</strong>
                      <span>{[customer.reference, customer.legalName || customer.taxId || "Sin razon social"].filter(Boolean).join(" - ")}</span>
                    </td>
                    <td data-label="Contacto">
                      <strong>{customer.phone || "Sin telefono"}</strong>
                      <span>{customer.email || customer.address || "Sin contacto"}</span>
                    </td>
                    <td data-label="Estado" className="centerColumn">
                      <span className={`statusPill ${customer.status.toLowerCase()}`}>
                        {statusLabels[customer.status]}
                      </span>
                    </td>
                    <td data-label="Geozona" className="centerColumn">
                      <GeoZoneButton target={customer} />
                    </td>
                    <td data-label="Sitios" className="centerColumn countCell">{customer._count.sites}</td>
                    <td data-label="Trabajos" className="centerColumn countCell">{customer._count.workOrders}</td>
                    <td data-label="Acciones">
                      <button
                        type="button"
                        className="iconTextButton"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditCustomer(customer);
                        }}
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {!customers.length ? (
                  <tr>
                    <td colSpan={7} className="emptyTable">
                      {copy.emptyList}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sitesPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>{copy.sitesTitle}</p>
              <h2>{selectedCustomer ? selectedCustomer.name : copy.selectedTitle}</h2>
            </div>
            <button type="button" className="secondaryButton" onClick={onSiteRefresh} disabled={!selectedCustomer}>
              <RefreshCw size={17} className={sitesLoading ? "spin" : ""} />
              Actualizar
            </button>
          </div>

          <div className="sitesPanelBody">
            <form className="siteForm" onSubmit={onSiteSave}>
              <label>
                Nombre
                <input
                  value={siteForm.name}
                  onChange={(event) => onSiteFormChange({ ...siteForm, name: event.target.value })}
                  placeholder={selectedCustomer?.name ?? "Sitio"}
                  disabled={!selectedCustomer}
                />
              </label>
              <label>
                <span className="fieldLabelRow">
                  Direccion
                  <button type="button" className="geoButton" onClick={onLocateSite} disabled={!selectedCustomer || siteLocating}>
                    <MapPin size={16} />
                    {siteLocating ? "Ubicando" : "Usar ubicacion"}
                  </button>
                </span>
                <input
                  value={siteForm.address}
                  onChange={(event) => onSiteFormChange(applyCoordinatesFromText({ ...siteForm, address: event.target.value }))}
                  placeholder="Direccion, coordenadas o link de Google Maps"
                  disabled={!selectedCustomer}
                />
              </label>
              <label>
                Latitud
                <input
                  type="number"
                  step="0.000001"
                  value={siteForm.latitude ?? ""}
                  onChange={(event) =>
                    onSiteFormChange({
                      ...siteForm,
                      latitude: event.target.value === "" ? undefined : Number(event.target.value),
                    })
                  }
                  placeholder="-34.901112"
                  disabled={!selectedCustomer}
                />
              </label>
              <label>
                Longitud
                <input
                  type="number"
                  step="0.000001"
                  value={siteForm.longitude ?? ""}
                  onChange={(event) =>
                    onSiteFormChange({
                      ...siteForm,
                      longitude: event.target.value === "" ? undefined : Number(event.target.value),
                    })
                  }
                  placeholder="-56.164532"
                  disabled={!selectedCustomer}
                />
              </label>
              <label>
                Notas
                <input
                  value={siteForm.notes}
                  onChange={(event) => onSiteFormChange({ ...siteForm, notes: event.target.value })}
                  placeholder="Acceso, horario, referente"
                  disabled={!selectedCustomer}
                />
              </label>
              <div className="geoStatus">
                <MapPin size={16} />
                <span>{buildGeoStatusText(siteForm.latitude, siteForm.longitude, "Sin GPS: este sitio quedara fuera de la ruta automatica.")}</span>
              </div>
              {siteError ? <p className="formError">{siteError}</p> : null}
              <button type="submit" className="primaryButton" disabled={!selectedCustomer || sitesLoading}>
                <Plus size={18} />
                Agregar sitio
              </button>
            </form>

            <div className="siteList">
              {sites.map((site) => (
                <article key={site.id} className="siteCard">
                  <div>
                    <strong>{site.name}</strong>
                    <span>{site.address}</span>
                  </div>
                  <p>{site.notes || "Sin notas operativas"}</p>
                  <div className="siteMeta">
                    <span>{site._count.equipment} equipos</span>
                    <span>{site._count.workOrders} trabajos</span>
                    <GeoZoneButton target={site} compact />
                  </div>
                </article>
              ))}
              {selectedCustomer && !sites.length ? (
                <p className="emptyPanel">{copy.emptySites}</p>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      {(customerProfile || customerProfileLoading || customerProfileError) ? (
        <CustomerProfileModal
          error={customerProfileError}
          loading={customerProfileLoading}
          profile={customerProfile}
          onClose={onCloseProfile}
          onEdit={onEditCustomer}
          onAddDocument={onAddDocument}
          onComposeMail={onComposeMail}
          onComposeWhatsApp={onComposeWhatsApp}
          onDeleteDocument={onDeleteDocument}
          onOpenDocument={onOpenDocument}
          onOpenDeviceGroup={onOpenDeviceGroup}
          onOpenWorkOrder={onOpenWorkOrder}
        />
      ) : null}
    </section>
  );
}

function CustomerProfileModal({
  error,
  loading,
  profile,
  onClose,
  onEdit,
  onAddDocument,
  onComposeMail,
  onComposeWhatsApp,
  onDeleteDocument,
  onOpenDocument,
  onOpenDeviceGroup,
  onOpenWorkOrder,
}: {
  error: string;
  loading: boolean;
  profile: CustomerProfile | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onAddDocument: (customerId: string, payload: CustomerDocumentPayload) => Promise<void>;
  onComposeMail: (customer: Customer) => void;
  onComposeWhatsApp: (customer: Customer) => void;
  onDeleteDocument: (customerId: string, documentId: string) => Promise<void>;
  onOpenDocument: (customer: Customer, document: CustomerDocument) => void;
  onOpenDeviceGroup: (group: GroupedInstalledDevice) => void;
  onOpenWorkOrder: (workOrder: WorkOrder) => void;
}) {
  const customer = profile?.customer;
  const orderedWorkOrders = profile ? sortWorkOrdersByDate(profile.workOrders) : [];
  const orderedMeetings = profile ? [...profile.meetings].sort((left, right) => new Date(right.dateTime).getTime() - new Date(left.dateTime).getTime()) : [];
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const [documentUploading, setDocumentUploading] = useState(false);

  async function selectCustomerDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !customer) {
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      window.alert("El documento no puede superar los 8 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setDocumentUploading(true);
      try {
        await onAddDocument(customer.id, {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: reader.result,
        });
      } catch (error) {
        window.alert(`No se pudo agregar el documento: ${getErrorMessage(error)}`);
      } finally {
        setDocumentUploading(false);
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  function printCustomerProfile() {
    if (typeof document === "undefined") {
      window.print();
      return;
    }

    const cleanup = () => {
      document.body.classList.remove("printingCustomerProfile");
      window.removeEventListener("afterprint", cleanup);
    };

    document.body.classList.add("printingCustomerProfile");
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 60000);
  }

  return (
    <div className="deviceDetailOverlay customerProfileOverlay" onClick={onClose}>
      <section
        className="customerProfileModal printableCustomerProfile"
        aria-label="Ficha del cliente"
        onClick={(event) => event.stopPropagation()}
      >
        <img className="customerProfilePrintWatermark" src="/security-solutions-logo-bw.png" alt="" aria-hidden="true" />
        <header className="deviceDetailHeader">
          <div className="printCompanyIdentity" aria-hidden="true">
            <img src="/security-solutions-logo.png" alt="" />
            <div>
              <strong>Security Solutions</strong>
              <span>Proveedor de servicios</span>
            </div>
          </div>
          <div className="customerProfileTitleBlock">
            <span>Ficha de cliente</span>
            <h2>{customer?.name ?? "Cargando cliente"}</h2>
            <p>
              {customer
                ? [customer.reference, customer.legalName, customer.taxId, statusLabels[customer.status]].filter(Boolean).join(" - ")
                : "Preparando informacion operativa"}
            </p>
          </div>
          <div className="customerProfileHeaderSide">
            {customer ? (
              <>
                <div className="customerProfileLogoBox">
                  {customer.logoUrl ? (
                    <img src={customer.logoUrl} alt={`Logo ${customer.name}`} />
                  ) : (
                    <div>
                      <strong>{customer.name.slice(0, 2).toUpperCase()}</strong>
                      <span>{customer.reference}</span>
                    </div>
                  )}
                </div>
                <div className="printCustomerCaption" aria-hidden="true">
                  <strong>{customer.name}</strong>
                  <span>Cliente</span>
                </div>
              </>
            ) : null}
          </div>
          <div className="customerProfileActionBar">
            <div className="documentToolbarActions">
              {customer ? (
                <>
                  <button type="button" className="secondaryButton printHidden" onClick={printCustomerProfile}>
                    <Printer size={16} />
                    Imprimir
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => onComposeWhatsApp(customer)}>
                    <MessageSquare size={16} />
                    WhatsApp
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => onComposeMail(customer)}>
                    <Mail size={16} />
                    Mail
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => onEdit(customer)}>
                    <Edit3 size={16} />
                    Editar
                  </button>
                </>
              ) : null}
              <button type="button" className="iconButton" onClick={onClose} aria-label="Cerrar ficha">
                <X size={18} />
              </button>
            </div>
          </div>
        </header>

        {loading ? <p className="emptyPanel">Cargando ficha completa...</p> : null}
        {error ? <p className="formError">{error}</p> : null}

        {profile ? (
          <div className="customerProfileBody">
            <section className="customerProfileSection">
              <h3>Datos del cliente</h3>
              <dl className="customerProfileGrid">
                <div>
                  <dt>Referencia</dt>
                  <dd>{profile.customer.reference}</dd>
                </div>
                {profile.customer.taxId ? (
                  <div>
                    <dt>RUT / Documento</dt>
                    <dd>{profile.customer.taxId}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Telefono</dt>
                  <dd>{profile.customer.phone || "Sin telefono"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.customer.email || "Sin email"}</dd>
                </div>
                <div>
                  <dt>Direccion</dt>
                  <dd><AddressDisplay value={profile.customer.address} /></dd>
                </div>
                <div>
                  <dt>Geozona</dt>
                  <dd><GeoZoneButton target={profile.customer} /></dd>
                </div>
                <div>
                  <dt>Notas</dt>
                  <dd>{profile.customer.notes || "Sin notas"}</dd>
                </div>
              </dl>
            </section>

            <section className="customerProfileSection">
              <h3>Sitios</h3>
              <div className="customerProfileList">
                {profile.sites.map((site) => (
                  <article key={site.id}>
                    <strong>{site.name}</strong>
                    <AddressDisplay value={site.address} />
                    <div className="profileGeoRow">
                      <small>{site._count.equipment} equipos - {site._count.workOrders} trabajos</small>
                      <GeoZoneButton target={site} compact />
                    </div>
                  </article>
                ))}
                {!profile.sites.length ? <p className="emptyPanel">Sin sitios cargados.</p> : null}
              </div>
            </section>

            <section className="customerProfileSection wideProfileSection">
              <h3>Linea de tiempo comercial</h3>
              <div className="customerProfileList meetingProfileList">
                {orderedMeetings.map((meeting) => (
                  <article key={meeting.id}>
                    <div className="meetingProfileHeader">
                      <strong>{formatShortDate(meeting.dateTime)} - {meeting.objective}</strong>
                      <span className={`statusPill ${meetingStatusClass(meeting.status)}`}>
                        {meetingStatusLabels[meeting.status]}
                      </span>
                    </div>
                    <small>
                      {meetingTypeLabels[meeting.type]} - {meeting.contact || "Sin contacto"} - {meeting.closeProbability ?? 0}%
                    </small>
                    <MeetingTimeline meeting={meeting} />
                  </article>
                ))}
                {!orderedMeetings.length ? <p className="emptyPanel">Sin reuniones registradas.</p> : null}
              </div>
            </section>

            <section className="customerProfileSection wideProfileSection">
              <h3>Ordenes realizadas</h3>
              <div className="customerProfileTableWrap">
                <table className="customerProfileOrdersTable">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Orden</th>
                      <th>Sitio</th>
                      <th>Estado</th>
                      <th>Equipos / Materiales</th>
                      <th aria-label="Accion" />
                    </tr>
                  </thead>
                  <tbody>
                    {orderedWorkOrders.map((workOrder) => {
                      const materials = groupWorkOrderMaterials(workOrder.inventoryMovements ?? []);
                      return (
                        <tr key={workOrder.id} onClick={() => onOpenWorkOrder(workOrder)}>
                          <td data-label="Fecha">
                            <strong>{formatShortDate(workOrder.completedAt ?? workOrder.scheduledAt ?? workOrder.updatedAt)}</strong>
                            <span>{formatTime(workOrder.completedAt ?? workOrder.scheduledAt)}</span>
                          </td>
                          <td data-label="Orden">
                            <strong>{workOrder.title}</strong>
                            <span>{deviceTypeLabels[workOrder.type]}</span>
                          </td>
                          <td data-label="Sitio">
                            <strong>{workOrder.site?.name ?? "Sin sitio"}</strong>
                            <AddressDisplay value={workOrder.site?.address} />
                          </td>
                          <td data-label="Estado">
                            <span className={`statusPill ${workOrder.status.toLowerCase()}`}>
                              {workStatusLabels[workOrder.status]}
                            </span>
                          </td>
                          <td data-label="Equipos / Materiales">
                            <span className="materialSummary">
                              {materials.length ? materials.map((item) => `${item.name} x${item.quantity}`).join(" / ") : "Sin materiales"}
                            </span>
                          </td>
                          <td data-label="Accion">
                            <button
                              type="button"
                              className="iconTextButton"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenWorkOrder(workOrder);
                              }}
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!orderedWorkOrders.length ? (
                      <tr>
                        <td colSpan={6} className="emptyTable">Sin ordenes cargadas.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="customerProfileSection printFullWidthSection">
              <h3>Equipos instalados</h3>
              <div className="customerProfileTableWrap">
                <table className="customerProfileOrdersTable customerProfileDevicesTable">
                  <thead>
                    <tr>
                      <th>Modelo</th>
                      <th>Cant.</th>
                      <th>Tipo</th>
                      <th>Sitio</th>
                      <th>Orden</th>
                      <th>Series</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupInstalledDevices(profile.equipment).map((group) => {
                      const orders = group.clientGroups.flatMap((client) => client.orders);
                      return (
                        <tr
                          key={group.key}
                          className="clickableRow"
                          onClick={() => onOpenDeviceGroup(group)}
                          title="Abrir en modulo Equipos"
                        >
                          <td data-label="Modelo">
                            <strong>{group.model}</strong>
                            <span>{group.brand || "Sin marca"}</span>
                          </td>
                          <td data-label="Cant.">
                            <strong>{group.quantity}</strong>
                          </td>
                          <td data-label="Tipo">
                            <span>{deviceTypeLabels[group.type]}</span>
                          </td>
                          <td data-label="Sitio">
                            <span>{group.sites}</span>
                          </td>
                          <td data-label="Orden">
                            <span>
                              {orders.length
                                ? orders.map((order) => `${order.title} x${order.quantity}`).join(" / ")
                                : "Sin orden relacionada"}
                            </span>
                          </td>
                          <td data-label="Series">
                            <span>{group.serialCount ? `${group.serialCount} registradas` : "Sin series"}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {!profile.equipment.length ? (
                      <tr>
                        <td colSpan={6} className="emptyTable">Sin equipos instalados vinculados.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="customerProfileSection printHiddenSection">
              <div className="customerProfileSectionHeader">
                <h3>Documentos adjuntos</h3>
                <button type="button" className="secondaryButton" onClick={() => documentInputRef.current?.click()} disabled={!customer || documentUploading}>
                  <FileText size={16} />
                  {documentUploading ? "Agregando" : "Agregar documento"}
                </button>
              </div>
              <input
                ref={documentInputRef}
                type="file"
                className="hiddenFileInput"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.txt,image/*,application/pdf"
                onChange={selectCustomerDocument}
              />
              <div className="customerProfileList">
                {profile.documents.map((document) => (
                  <div key={document.id} className="customerProfileDocumentRow">
                    <button
                      type="button"
                      className="customerProfileDocumentButton"
                      onClick={() => customer && onOpenDocument(customer, document)}
                    >
                      <strong>{document.name}</strong>
                      <span>{document.mimeType || document.type || "Documento"}</span>
                      <small>{document.createdAt ? formatDateTime(document.createdAt) : "Sin fecha"}</small>
                    </button>
                    <button
                      type="button"
                      className="iconButton dangerIconButton"
                      aria-label="Eliminar documento"
                      onClick={() => {
                        if (customer) {
                          void onDeleteDocument(customer.id, document.id);
                        }
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {!profile.documents.length ? <p className="emptyPanel">Todavia no hay documentos adjuntos.</p> : null}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function AgendaView({
  agendaDate,
  agendaError,
  agendaMeetingsOverdue,
  agendaMeetingsToday,
  agendaMeetingsWeek,
  agendaOverdue,
  agendaStats,
  agendaStatus,
  agendaToday,
  agendaWeek,
  loading,
  selectedDate,
  onDateChange,
  onRefresh,
  onStatusChange,
  onUpdateMeetingStatus,
  onUpdateStatus,
}: {
  agendaDate: string;
  agendaError: string;
  agendaMeetingsOverdue: Meeting[];
  agendaMeetingsToday: Meeting[];
  agendaMeetingsWeek: Meeting[];
  agendaOverdue: WorkOrder[];
  agendaStats: Array<{ label: string; value: number }>;
  agendaStatus: WorkOrderStatus | "ALL";
  agendaToday: WorkOrder[];
  agendaWeek: WorkOrder[];
  loading: boolean;
  selectedDate: Date;
  onDateChange: (value: string) => void;
  onRefresh: () => void;
  onStatusChange: (value: WorkOrderStatus | "ALL") => void;
  onUpdateMeetingStatus: (id: string, status: MeetingStatus) => void;
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
}) {
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startOfDay(selectedDate), index);
    const count =
      agendaWeek.filter((workOrder) => isSameDay(workOrder.scheduledAt, date)).length +
      agendaMeetingsWeek.filter((meeting) => isSameDay(meeting.dateTime, date)).length;
    return { date, count };
  });

  return (
    <section className="agendaModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de agenda">
        {agendaStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <section className="agendaToolbar">
        <div>
          <p>Planificacion</p>
          <h2>{formatFullDate(selectedDate)}</h2>
        </div>
        <div className="agendaControls">
          <input
            type="date"
            value={agendaDate}
            onChange={(event) => onDateChange(event.target.value)}
            aria-label="Fecha de agenda"
          />
          <select
            value={agendaStatus}
            onChange={(event) => onStatusChange(event.target.value as WorkOrderStatus | "ALL")}
            aria-label="Filtrar estado de agenda"
          >
            <option value="ALL">Todos</option>
            {Object.entries(workStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="button" onClick={onRefresh}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Actualizar
          </button>
        </div>
      </section>

      {agendaError ? <p className="formError">{agendaError}</p> : null}

      <div className="agendaWeekStrip" aria-label="Semana seleccionada">
        {weekDays.map((day) => (
          <button
            key={day.date.toISOString()}
            type="button"
            className={isSameDay(day.date, selectedDate) ? "selectedDay" : ""}
            onClick={() => onDateChange(toDateInputValue(day.date))}
          >
            <span>{formatShortWeekday(day.date)}</span>
            <strong>{day.date.getDate()}</strong>
            <em>{day.count}</em>
          </button>
        ))}
      </div>

      <div className="agendaLayout">
        <section className="agendaColumn agendaMain">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Dia seleccionado</p>
              <h2>Agenda de hoy</h2>
            </div>
          </div>
          <AgendaWorkList workOrders={agendaToday} emptyText="No hay trabajos para esta fecha." onUpdateStatus={onUpdateStatus} />
          <AgendaMeetingList meetings={agendaMeetingsToday} emptyText="No hay reuniones para esta fecha." onUpdateStatus={onUpdateMeetingStatus} />
        </section>

        <section className="agendaColumn">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Seguimiento</p>
              <h2>Atrasados</h2>
            </div>
          </div>
          <AgendaWorkList workOrders={agendaOverdue} emptyText="No hay trabajos atrasados." onUpdateStatus={onUpdateStatus} compact />
          <AgendaMeetingList meetings={agendaMeetingsOverdue} emptyText="No hay reuniones atrasadas." onUpdateStatus={onUpdateMeetingStatus} compact />
        </section>

        <section className="agendaColumn">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Proximos dias</p>
              <h2>Semana</h2>
            </div>
          </div>
          <AgendaWorkList workOrders={agendaWeek} emptyText="No hay trabajos en la semana." onUpdateStatus={onUpdateStatus} compact />
          <AgendaMeetingList meetings={agendaMeetingsWeek} emptyText="No hay reuniones en la semana." onUpdateStatus={onUpdateMeetingStatus} compact />
        </section>
      </div>
    </section>
  );
}

function DispatcherView({
  agendaDate,
  loading,
  selectedDate,
  token,
  vehicles,
  workOrders,
  onDateChange,
  onRefresh,
}: {
  agendaDate: string;
  loading: boolean;
  selectedDate: Date;
  token?: string | null;
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onDateChange: (value: string) => void;
  onRefresh: () => void;
}) {
  const [stopKinds, setStopKinds] = useState<Record<string, DispatchStopKind>>({});
  const [stopDurations, setStopDurations] = useState<Record<string, number>>({});
  const [stopZones, setStopZones] = useState<Record<string, string>>({});
  const [stopTimes, setStopTimes] = useState<Record<string, string>>({});
  const [savingStopId, setSavingStopId] = useState<string | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState("");
  const [dailySummary, setDailySummary] = useState<VehicleDailySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [routeCopied, setRouteCopied] = useState(false);
  const [routeReviewed, setRouteReviewed] = useState(false);
  const [materialsConfirmed, setMaterialsConfirmed] = useState(false);
  const [baseForm, setBaseForm] = useState({
    companyName: "Security Solutions",
    companyAddress: "",
    companyLatitude: undefined as number | undefined,
    companyLongitude: undefined as number | undefined,
  });
  const [baseSaving, setBaseSaving] = useState(false);
  const [baseMessage, setBaseMessage] = useState("");
  const plan = useMemo(
    () => buildDispatchPlan(workOrders, baseForm, { durations: stopDurations, zones: stopZones }),
    [workOrders, baseForm, stopDurations, stopZones],
  );
  const activeVehicles = vehicles.filter((vehicle) => vehicle.active);
  const selectedVehicle = activeVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? activeVehicles[0] ?? null;
  const mapsUrl = useMemo(() => buildGoogleMapsRouteUrl(plan.orderedStops, plan.baseLocation), [plan.orderedStops, plan.baseLocation]);
  const dispatchSummary = useMemo(() => buildDispatcherDailySummary(plan, workOrders, selectedVehicle, dailySummary), [plan, workOrders, selectedVehicle, dailySummary]);
  const routeReady = routeReviewed || Boolean(mapsUrl && plan.orderedStops.length && !plan.missingLocation.length);
  const materialsReady =
    materialsConfirmed ||
    (workOrders.length > 0 && workOrders.every((workOrder) => (workOrder.inventoryMovements?.length ?? 0) > 0));

  useEffect(() => {
    setRouteReviewed(false);
    setMaterialsConfirmed(false);
    setStopDurations({});
    setStopZones({});
    setStopTimes({});
    setDispatchMessage("");
  }, [agendaDate, workOrders]);

  useEffect(() => {
    if (!token || !selectedVehicle?.traccarDeviceId) {
      setDailySummary(null);
      return;
    }

    let active = true;
    async function loadDailySummary() {
      setSummaryLoading(true);
      try {
        const data = await apiRequest<VehicleDailySummary>(
          `/api/vehicles/${selectedVehicle!.id}/traccar/daily?date=${encodeURIComponent(agendaDate)}`,
          { token: token! },
        );
        if (active) {
          setDailySummary(data);
        }
      } catch {
        if (active) {
          setDailySummary(null);
        }
      } finally {
        if (active) {
          setSummaryLoading(false);
        }
      }
    }

    void loadDailySummary();
    const timer = window.setInterval(loadDailySummary, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [agendaDate, selectedVehicle?.id, selectedVehicle?.traccarDeviceId, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    apiRequest<TraccarSettings>("/api/vehicles/traccar/settings", { token })
      .then((settings) => {
        if (!active) {
          return;
        }
        setBaseForm({
          companyName: settings.companyName ?? "Security Solutions",
          companyAddress: settings.companyAddress ?? "",
          companyLatitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLatitude) : undefined,
          companyLongitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLongitude) : undefined,
        });
      })
      .catch((error) => {
        if (active) {
          setBaseMessage(`No se pudo cargar la base operativa: ${getErrorMessage(error)}`);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function copyRouteSummary() {
    const text = buildDispatchRouteText(plan.orderedStops, selectedVehicle, plan.baseLocation);
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setRouteCopied(true);
      window.setTimeout(() => setRouteCopied(false), 1800);
    } catch {
      setRouteCopied(false);
      window.alert(text);
    }
  }

  async function saveBaseSettings() {
    if (!token) {
      return;
    }

    const coords = resolveDispatchBaseLocation(baseForm);
    const normalizedCoordinates = normalizeCompanyCoordinates(
      coords?.latitude ?? baseForm.companyLatitude,
      coords?.longitude ?? baseForm.companyLongitude,
    );
    if (!normalizedCoordinates) {
      setBaseMessage("Coordenadas invalidas. En Uruguay usa latitud -34.xxxxxx y longitud -56.xxxxxx.");
      return;
    }

    setBaseSaving(true);
    setBaseMessage("");
    try {
      const settings = await apiRequest<TraccarSettings>("/api/vehicles/traccar/settings", {
        token,
        method: "PATCH",
        body: JSON.stringify({
          companyName: baseForm.companyName || "Security Solutions",
          companyAddress: baseForm.companyAddress,
          companyLatitude: normalizedCoordinates.latitude,
          companyLongitude: normalizedCoordinates.longitude,
        }),
      });
      setBaseForm({
        companyName: settings.companyName ?? "Security Solutions",
        companyAddress: settings.companyAddress ?? "",
        companyLatitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLatitude) : undefined,
        companyLongitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLongitude) : undefined,
      });
      setBaseMessage("Base operativa guardada.");
    } catch (error) {
      setBaseMessage(`No se pudo guardar la base: ${getErrorMessage(error)}`);
    } finally {
      setBaseSaving(false);
    }
  }

  async function updateStopTime(workOrder: WorkOrder, time: string) {
    if (!token || !time) {
      return;
    }

    const nextDate = mergeDateAndTime(selectedDate, time);
    setSavingStopId(workOrder.id);
    setDispatchMessage("");
    try {
      await apiRequest<WorkOrder>(`/api/work-orders/${workOrder.id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ scheduledAt: nextDate.toISOString() }),
      });
      setDispatchMessage("Hora de agenda actualizada.");
      onRefresh();
    } catch (error) {
      setDispatchMessage(`No se pudo guardar la hora: ${getErrorMessage(error)}`);
    } finally {
      setSavingStopId(null);
    }
  }

  return (
    <section className="dispatcherModule">
      <div className="summaryGrid customerStats" aria-label="Resumen del despachador">
        <article>
          <span>Trabajos del dia</span>
          <strong>{workOrders.length}</strong>
        </article>
        <article>
          <span>Con ubicacion</span>
          <strong>{plan.routableStops.length}</strong>
        </article>
        <article>
          <span>Sin ubicacion</span>
          <strong>{plan.missingLocation.length}</strong>
        </article>
        <article>
          <span>Km estimados</span>
          <strong>{formatNumber(plan.estimatedKm)} km</strong>
        </article>
      </div>

      <section className="dispatcherToolbar">
        <div>
          <p>Despachador inteligente</p>
          <h2>{formatFullDate(selectedDate)}</h2>
          <span>
            {selectedVehicle ? `Movil asignado: ${selectedVehicle.name}` : "Sin vehiculo activo asignado"}
          </span>
        </div>
        <div className="agendaControls">
          <input type="date" value={agendaDate} onChange={(event) => onDateChange(event.target.value)} />
          <select value={selectedVehicle?.id ?? ""} onChange={(event) => setSelectedVehicleId(event.target.value)}>
            {activeVehicles.length ? null : <option value="">Sin vehiculos</option>}
            {activeVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={copyRouteSummary} disabled={!plan.orderedStops.length}>
            <FileText size={18} />
            {routeCopied ? "Copiada" : "Copiar ruta"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (mapsUrl) {
                window.open(mapsUrl, "_blank", "noopener,noreferrer");
                setRouteReviewed(true);
              }
            }}
            disabled={!mapsUrl}
          >
            <MapPin size={18} />
            Abrir Maps
          </button>
          <button type="button" onClick={onRefresh}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Organizar dia
          </button>
        </div>
      </section>

      <div className="dispatcherLayout">
        <section className="dispatcherRoutePanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Ruta sugerida</p>
              <h2>Linea de paradas</h2>
            </div>
            <span className="statusPill completed">{plan.strategy}</span>
          </div>

          <div className="dispatchTimeline">
            <article className="dispatchStop dispatchBaseStop">
              <span className="dispatchStopIndex">0</span>
              <div>
                <strong>{baseForm.companyName || "Base / Empresa"}</strong>
                <p>{plan.baseLocation?.address || "Punto inicial de salida"}</p>
                <small>
                  {plan.baseLocation
                    ? "Salida desde la base configurada"
                    : "Configura coordenadas de empresa para calcular salida"}
                </small>
              </div>
            </article>

            {plan.orderedStops.map((stop, index) => {
              const kind = stopKinds[stop.workOrder.id] ?? "CLIENT";
              return (
                <article key={stop.workOrder.id} className="dispatchStop">
                  <span className="dispatchStopIndex">{index + 1}</span>
                  <div className="dispatchStopBody">
                    <header>
                      <div>
                        <strong>{stop.workOrder.title}</strong>
                        <p>{stop.workOrder.customer.name} - {stop.siteLabel}</p>
                      </div>
                      <span className={`statusPill ${workOrderStatusClass(stop.workOrder.status)}`}>
                        {workStatusLabels[stop.workOrder.status]}
                      </span>
                    </header>
                    <dl className="dispatchStopDetails">
                      <div>
                        <dt>Hora</dt>
                        <dd className="dispatchTimeValue">{stopTimes[stop.workOrder.id] || formatInputTime(stop.workOrder.scheduledAt)}</dd>
                      </div>
                      <div>
                        <dt>Zona</dt>
                        <dd>{stop.zone}</dd>
                      </div>
                      <div>
                        <dt>Duracion</dt>
                        <dd>{formatDuration(stop.estimatedMinutes)}</dd>
                      </div>
                      <div>
                        <dt>Tramo</dt>
                        <dd>{stop.legKm ? `${formatNumber(stop.legKm)} km` : "Inicio"}</dd>
                      </div>
                    </dl>
                    <div className="dispatchStopControls">
                      <label>
                        Hora visible
                        <input
                          type="time"
                          value={stopTimes[stop.workOrder.id] ?? formatInputTime(stop.workOrder.scheduledAt)}
                          onChange={(event) =>
                            setStopTimes((current) => ({
                              ...current,
                              [stop.workOrder.id]: event.target.value,
                            }))
                          }
                          onBlur={(event) => {
                            if (event.target.value !== formatInputTime(stop.workOrder.scheduledAt)) {
                              void updateStopTime(stop.workOrder, event.target.value);
                            }
                          }}
                          disabled={savingStopId === stop.workOrder.id}
                        />
                      </label>
                      <label>
                        Tipo de parada
                        <select
                          value={kind}
                          onChange={(event) => setStopKinds((current) => ({ ...current, [stop.workOrder.id]: event.target.value as DispatchStopKind }))}
                        >
                          <option value="CLIENT">Cliente</option>
                          <option value="NOT_CLIENT">No cliente</option>
                          <option value="WAREHOUSE">Deposito</option>
                          <option value="LUNCH">Almuerzo</option>
                          <option value="TRANSFER">Traslado</option>
                        </select>
                      </label>
                      <label>
                        Tiempo operativo
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={stopDurations[stop.workOrder.id] ?? stop.estimatedMinutes}
                          onChange={(event) =>
                            setStopDurations((current) => ({
                              ...current,
                              [stop.workOrder.id]: Math.max(0, Number(event.target.value) || 0),
                            }))
                          }
                        />
                      </label>
                      <label>
                        Zona operativa
                        <input
                          value={stopZones[stop.workOrder.id] ?? stop.zone}
                          onChange={(event) =>
                            setStopZones((current) => ({
                              ...current,
                              [stop.workOrder.id]: event.target.value,
                            }))
                          }
                          placeholder="Ej: Centro, Carrasco, Pocitos"
                        />
                      </label>
                    </div>
                    {savingStopId === stop.workOrder.id ? <small>Guardando hora...</small> : null}
                  </div>
                </article>
              );
            })}

            <article className="dispatchStop dispatchBaseStop">
              <span className="dispatchStopIndex">{plan.orderedStops.length + 1}</span>
              <div>
                <strong>Regreso / cierre</strong>
                <p>{plan.baseLocation ? plan.baseLocation.name : "Fin de recorrido operativo"}</p>
                <small>
                  {plan.returnKm ? `${formatNumber(plan.returnKm)} km de regreso. ` : ""}
                  {formatDuration(plan.estimatedMinutes)} de trabajo estimado en total
                </small>
              </div>
            </article>
          </div>
        </section>

        <section className="dispatcherSidePanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Control</p>
              <h2>Alertas de planificacion</h2>
            </div>
          </div>
          <div className="dispatcherAlertList">
            {plan.alerts.map((alert) => (
              <article key={alert}>
                <MapPin size={17} />
                <span>{alert}</span>
              </article>
            ))}
            {!plan.alerts.length ? <p className="emptyPanel">La ruta esta lista para revisar.</p> : null}
          </div>

          <div className="dispatcherMetrics">
            <article>
              <span>Base operativa</span>
              <strong>{plan.baseLocation ? "Lista" : "Sin GPS"}</strong>
            </article>
            <article>
              <span>Tiempo operativo</span>
              <strong>{formatDuration(dispatchSummary.operationalMinutes)}</strong>
            </article>
            <article>
              <span>Ruta en Maps</span>
              <strong>{mapsUrl ? "Lista" : "Sin GPS"}</strong>
            </article>
            <article>
              <span>Zonas</span>
              <strong>{plan.zones.length || 0}</strong>
            </article>
            <article>
              <span>Vehiculos activos</span>
              <strong>{activeVehicles.length}</strong>
            </article>
          </div>
          {dispatchMessage ? <p className="dispatcherBaseMessage">{dispatchMessage}</p> : null}

          <section className="dispatcherDailySummary">
            <div className="sectionHeader compactHeader">
              <div>
                <p>Resumen diario</p>
                <h2>Cierre 23:59</h2>
              </div>
              <span className="statusPill completed">{summaryLoading ? "Actualizando" : "En vivo"}</span>
            </div>
            <div className="dispatcherSummaryGrid">
              <article>
                <span>Km reales</span>
                <strong>{formatNumber(dispatchSummary.distanceKm)} km</strong>
              </article>
              <article>
                <span>Combustible</span>
                <strong>{formatNumber(dispatchSummary.estimatedLiters)} L</strong>
              </article>
              <article>
                <span>Gasto estimado</span>
                <strong>{formatCurrency(dispatchSummary.estimatedFuelCost)}</strong>
              </article>
              <article>
                <span>Clientes visitados</span>
                <strong>{dispatchSummary.visitedClients}</strong>
              </article>
            </div>
            <p>
              Se actualiza durante el dia con Traccar cada 5 minutos. A las 23:59 queda como resumen final del dia.
            </p>
            <div className="dispatcherVisitList">
              {dispatchSummary.visitNames.slice(0, 6).map((visit) => (
                <span key={visit}>{visit}</span>
              ))}
              {!dispatchSummary.visitNames.length ? <span>Sin visitas confirmadas todavia</span> : null}
            </div>
          </section>

          <section className="dispatcherChecklist">
            <h3>Checklist de salida</h3>
            <ul>
              <li className={selectedVehicle ? "ready" : "pending"}>
                <span>Vehiculo asignado</span>
                <strong>{selectedVehicle ? "Listo" : "Pendiente"}</strong>
              </li>
              <li className={plan.baseLocation ? "ready" : "pending"}>
                <span>Base configurada</span>
                <strong>{plan.baseLocation ? "Listo" : "Pendiente"}</strong>
              </li>
              <li className={!plan.missingLocation.length && plan.orderedStops.length ? "ready" : "pending"}>
                <span>Ubicaciones completas</span>
                <strong>{!plan.missingLocation.length && plan.orderedStops.length ? "Listo" : "Pendiente"}</strong>
              </li>
              <li className={routeReady ? "ready" : "pending"}>
                <span>Ruta revisada</span>
                <button type="button" onClick={() => setRouteReviewed(true)} disabled={!plan.orderedStops.length}>
                  {routeReady ? "Listo" : "Confirmar"}
                </button>
              </li>
              <li className={materialsReady ? "ready" : "pending"}>
                <span>Materiales confirmados</span>
                <button type="button" onClick={() => setMaterialsConfirmed(true)}>
                  {materialsReady ? "Listo" : "Confirmar"}
                </button>
              </li>
            </ul>
          </section>

          {plan.missingLocation.length ? (
            <section className="missingLocationPanel">
              <h3>Falta ubicacion</h3>
              {plan.missingLocation.map((workOrder) => (
                <article key={workOrder.id}>
                  <strong>{workOrder.title}</strong>
                  <span>{workOrder.customer.name}</span>
                  <small>{workOrder.site?.address || "Sin sitio/direccion con coordenadas"}</small>
                </article>
              ))}
            </section>
          ) : null}

          <section className="dispatcherBasePanel">
            <h3>Base operativa</h3>
            <label>
              Nombre
              <input
                value={baseForm.companyName}
                onChange={(event) => setBaseForm((form) => ({ ...form, companyName: event.target.value }))}
                placeholder="Security Solutions"
              />
            </label>
            <label>
              Direccion o Maps
              <input
                value={baseForm.companyAddress}
                onChange={(event) => {
                  const companyAddress = event.target.value;
                  const coords = parseCoordinatesFromText(companyAddress);
                  setBaseForm((form) => ({
                    ...form,
                    companyAddress,
                    companyLatitude: coords?.latitude ?? form.companyLatitude,
                    companyLongitude: coords?.longitude ?? form.companyLongitude,
                  }));
                }}
                placeholder="Pega direccion o enlace de Google Maps"
              />
            </label>
            <div className="dispatcherBaseCoords">
              <label>
                Latitud
                <input
                  type="number"
                  step="0.000001"
                  value={baseForm.companyLatitude ?? ""}
                  onChange={(event) =>
                    setBaseForm((form) => ({
                      ...form,
                      companyLatitude: event.target.value === "" ? undefined : Number(event.target.value),
                    }))
                  }
                  placeholder="-34.901112"
                />
              </label>
              <label>
                Longitud
                <input
                  type="number"
                  step="0.000001"
                  value={baseForm.companyLongitude ?? ""}
                  onChange={(event) =>
                    setBaseForm((form) => ({
                      ...form,
                      companyLongitude: event.target.value === "" ? undefined : Number(event.target.value),
                    }))
                  }
                  placeholder="-56.164532"
                />
              </label>
            </div>
            <button type="button" className="secondaryButton" onClick={saveBaseSettings} disabled={baseSaving}>
              <Save size={16} />
              {baseSaving ? "Guardando" : "Guardar base"}
            </button>
            <small className="dispatcherBaseHint">
              En Uruguay la latitud suele ser negativa y la longitud tambien, por ejemplo -34.xxxxxx / -56.xxxxxx.
            </small>
            {baseMessage ? <p className="dispatcherBaseMessage">{baseMessage}</p> : null}
          </section>
        </section>
      </div>
    </section>
  );
}

function AgendaWorkList({
  compact,
  emptyText,
  workOrders,
  onUpdateStatus,
}: {
  compact?: boolean;
  emptyText: string;
  workOrders: WorkOrder[];
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
}) {
  if (!workOrders.length) {
    return <p className="emptyPanel">{emptyText}</p>;
  }

  return (
    <div className={compact ? "agendaList compactAgendaList" : "agendaList"}>
      {workOrders.map((workOrder) => (
        <article key={workOrder.id} className="agendaItem">
          <div className="agendaTime">
            <strong>{formatTime(workOrder.scheduledAt)}</strong>
            <span>{formatShortDate(workOrder.scheduledAt)}</span>
          </div>
          <div className="agendaItemBody">
            <span className={`statusPill ${workOrder.status.toLowerCase()}`}>
              {workStatusLabels[workOrder.status]}
            </span>
            <h3>{workOrder.title}</h3>
            <dl>
              <div>
                <dt>Cliente</dt>
                <dd>{workOrder.customer.name}</dd>
              </div>
              <div>
                <dt>Sitio</dt>
                <dd>{workOrder.site?.name ?? "Sin sitio"}</dd>
              </div>
            </dl>
            <p>{workOrder.notes || workOrder.site?.address || "Sin notas operativas"}</p>
            <div className="workOrderActions">
              <button
                type="button"
                className="secondaryButton"
                onClick={() => onUpdateStatus(workOrder.id, "IN_PROGRESS")}
                disabled={workOrder.status === "IN_PROGRESS" || workOrder.status === "COMPLETED"}
              >
                En curso
              </button>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => onUpdateStatus(workOrder.id, "COMPLETED")}
                disabled={workOrder.status === "COMPLETED"}
              >
                Completar
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function AgendaMeetingList({
  compact,
  emptyText,
  meetings,
  onUpdateStatus,
}: {
  compact?: boolean;
  emptyText: string;
  meetings: Meeting[];
  onUpdateStatus: (id: string, status: MeetingStatus) => void;
}) {
  if (!meetings.length) {
    return <p className="emptyPanel">{emptyText}</p>;
  }

  return (
    <div className={compact ? "agendaList compactAgendaList" : "agendaList"}>
      {meetings.map((meeting) => (
        <article key={meeting.id} className="agendaItem agendaMeetingItem">
          <div className="agendaTime">
            <strong>{formatTime(meeting.dateTime)}</strong>
            <span>{formatShortDate(meeting.dateTime)}</span>
          </div>
          <div className="agendaItemBody">
            <span className={`statusPill ${meetingStatusClass(meeting.status)}`}>
              {meetingStatusLabels[meeting.status]}
            </span>
            <h3>{meeting.objective}</h3>
            <dl>
              <div>
                <dt>Cliente</dt>
                <dd>{meeting.customer.name}</dd>
              </div>
              <div>
                <dt>Contacto</dt>
                <dd>{meeting.contact || "Sin contacto"}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{meetingTypeLabels[meeting.type]}</dd>
              </div>
              <div>
                <dt>Cierre</dt>
                <dd>{meeting.closeProbability ?? 0}%</dd>
              </div>
            </dl>
            <p>{meeting.nextStep || meeting.needs || meeting.notes || "Sin notas comerciales"}</p>
            <div className="workOrderActions">
              <button
                type="button"
                className="secondaryButton"
                onClick={() => onUpdateStatus(meeting.id, "DONE")}
                disabled={meeting.status === "DONE"}
              >
                Aceptado
              </button>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => onUpdateStatus(meeting.id, "CANCELLED")}
                disabled={meeting.status === "CANCELLED"}
              >
                Cancelar
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function MeetingsView({
  customers,
  editingMeetingId,
  loading,
  meetingError,
  meetingForm,
  meetingSearch,
  meetingStats,
  meetingStatus,
  meetingType,
  meetings,
  selectedCustomerId,
  onCancelEdit,
  onEditMeeting,
  onFormChange,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onStatusChange,
  onTypeChange,
  onUpdateStatus,
}: {
  customers: Customer[];
  editingMeetingId: string | null;
  loading: boolean;
  meetingError: string;
  meetingForm: MeetingPayload;
  meetingSearch: string;
  meetingStats: Array<{ label: string; value: number | string }>;
  meetingStatus: MeetingStatus | "ALL";
  meetingType: MeetingType | "ALL";
  meetings: Meeting[];
  selectedCustomerId: string | null;
  onCancelEdit: () => void;
  onEditMeeting: (meeting: Meeting) => void;
  onFormChange: (form: MeetingPayload) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onStatusChange: (value: MeetingStatus | "ALL") => void;
  onTypeChange: (value: MeetingType | "ALL") => void;
  onUpdateStatus: (id: string, status: MeetingStatus) => void;
}) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null,
    [meetings, selectedMeetingId],
  );

  async function selectAttachments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size <= 8 * 1024 * 1024) {
        return true;
      }

      window.alert(`${file.name} supera los 8 MB.`);
      return false;
    });

    const attachments = await Promise.all(validFiles.map(readMeetingAttachment));
    onFormChange({
      ...meetingForm,
      attachments: [...(meetingForm.attachments ?? []), ...attachments],
    });
    event.target.value = "";
  }

  function removeAttachment(name: string) {
    onFormChange({
      ...meetingForm,
      attachments: (meetingForm.attachments ?? []).filter((attachment) => attachment.name !== name),
    });
  }

  return (
    <section className="meetingsModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de reuniones">
        {meetingStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="meetingsLayout">
        <form className="meetingForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>Seguimiento comercial</p>
              <h2>{editingMeetingId ? "Editar reunion" : "Nueva reunion"}</h2>
            </div>
            {editingMeetingId ? (
              <button type="button" className="secondaryButton" onClick={onCancelEdit}>
                <X size={16} />
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="formGrid">
            <label>
              Cliente
              <select
                value={meetingForm.customerId || ""}
                onChange={(event) => {
                  onFormChange({ ...meetingForm, customerId: event.target.value });
                }}
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha y hora
              <input
                type="datetime-local"
                value={meetingForm.dateTime}
                onChange={(event) => onFormChange({ ...meetingForm, dateTime: event.target.value })}
              />
            </label>
            <label>
              Contacto
              <input
                value={meetingForm.contact}
                onChange={(event) => onFormChange({ ...meetingForm, contact: event.target.value })}
                placeholder="Nombre de la persona"
              />
            </label>
            <label>
              Tipo
              <select
                value={meetingForm.type}
                onChange={(event) => onFormChange({ ...meetingForm, type: event.target.value as MeetingType })}
              >
                {Object.entries(meetingTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={meetingForm.status}
                onChange={(event) => onFormChange({ ...meetingForm, status: event.target.value as MeetingStatus })}
              >
                {Object.entries(meetingStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Probabilidad
              <select
                value={meetingForm.closeProbability}
                onChange={(event) => onFormChange({ ...meetingForm, closeProbability: Number(event.target.value) })}
              >
                {[25, 50, 75, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </label>
            <label>
              Aviso WhatsApp
              <select
                value={meetingForm.reminderEnabled ? "true" : "false"}
                onChange={(event) => onFormChange({ ...meetingForm, reminderEnabled: event.target.value === "true" })}
              >
                <option value="true">Activado</option>
                <option value="false">Desactivado</option>
              </select>
            </label>
            <label>
              Minutos antes
              <input
                type="number"
                min="1"
                value={meetingForm.reminderMinutesBefore ?? 30}
                onChange={(event) => onFormChange({ ...meetingForm, reminderMinutesBefore: Number(event.target.value) })}
              />
            </label>
            <label className="wideField">
              Objetivo
              <input
                value={meetingForm.objective}
                onChange={(event) => onFormChange({ ...meetingForm, objective: event.target.value })}
                placeholder="Primera reunion, relevamiento, seguimiento de presupuesto"
              />
            </label>
            <label className="wideField">
              Quien asistio
              <input
                value={meetingForm.attendees}
                onChange={(event) => onFormChange({ ...meetingForm, attendees: event.target.value })}
                placeholder="Personas presentes"
              />
            </label>
            <label className="wideField">
              Necesidades del cliente
              <textarea
                value={meetingForm.needs}
                onChange={(event) => onFormChange({ ...meetingForm, needs: event.target.value })}
                placeholder="Problema, alcance, zonas, horarios, prioridad"
              />
            </label>
            <label className="wideField">
              Equipos necesarios
              <textarea
                value={meetingForm.equipmentNeeded}
                onChange={(event) => onFormChange({ ...meetingForm, equipmentNeeded: event.target.value })}
                placeholder="Camaras, NVR, alarmas, sensores, cableado"
              />
            </label>
            <label>
              Presupuesto estimado
              <input
                type="number"
                min="0"
                step="0.01"
                value={meetingForm.estimatedBudget}
                onChange={(event) => onFormChange({ ...meetingForm, estimatedBudget: Number(event.target.value) })}
              />
            </label>
            <label>
              Fecha seguimiento
              <input
                type="date"
                value={meetingForm.followUpDate}
                onChange={(event) => onFormChange({ ...meetingForm, followUpDate: event.target.value })}
              />
            </label>
            <label className="wideField">
              Notas
              <textarea
                value={meetingForm.notes}
                onChange={(event) => onFormChange({ ...meetingForm, notes: event.target.value })}
                placeholder="Todo lo conversado"
              />
            </label>
            <label className="wideField">
              Compromisos
              <textarea
                value={meetingForm.commitments}
                onChange={(event) => onFormChange({ ...meetingForm, commitments: event.target.value })}
                placeholder="Lo acordado con el cliente"
              />
            </label>
            <label className="wideField">
              Proximo paso
              <input
                value={meetingForm.nextStep}
                onChange={(event) => onFormChange({ ...meetingForm, nextStep: event.target.value })}
                placeholder="Enviar presupuesto, llamar, coordinar visita"
              />
            </label>
          </div>

          <label className="attachmentPicker">
            <Paperclip size={17} />
            <span>Adjuntar archivos</span>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.mp3,.m4a,.wav,image/*,audio/*,application/pdf"
              onChange={selectAttachments}
            />
          </label>
          {meetingForm.attachments?.length ? (
            <div className="attachmentChips">
              {meetingForm.attachments.map((attachment) => (
                <button type="button" key={attachment.name} onClick={() => removeAttachment(attachment.name)}>
                  <Paperclip size={14} />
                  {attachment.name}
                  <X size={14} />
                </button>
              ))}
            </div>
          ) : null}

          {meetingError ? <p className="formError">{meetingError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            <Save size={18} />
            {editingMeetingId ? "Actualizar reunion" : "Registrar reunion"}
          </button>
        </form>

        <section className="meetingDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={meetingSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por cliente, objetivo, contacto o notas"
              />
            </label>
            <select value={meetingType} onChange={(event) => onTypeChange(event.target.value as MeetingType | "ALL")}>
              <option value="ALL">Todos los tipos</option>
              {Object.entries(meetingTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={meetingStatus} onChange={(event) => onStatusChange(event.target.value as MeetingStatus | "ALL")}>
              <option value="ALL">Todos</option>
              {Object.entries(meetingStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="meetingList" role="list">
            {meetings.length ? (
              <div className="meetingListHeader" aria-hidden="true">
                <span>Fecha</span>
                <span>Cliente</span>
                <span>Objetivo</span>
                <span>Contacto</span>
                <span>Estado</span>
                <span>Seguimiento</span>
              </div>
            ) : null}
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                className="meetingListRow"
                onClick={() => setSelectedMeetingId(meeting.id)}
              >
                <span className="meetingListCell" data-label="Fecha">
                  <strong>{formatDateTime(meeting.dateTime)}</strong>
                  <small>{meetingTypeLabels[meeting.type]}</small>
                </span>
                <span className="meetingListCell" data-label="Cliente">
                  <strong>{meeting.customer.name}</strong>
                  <small>{meeting.closeProbability ?? 0}% cierre</small>
                </span>
                <span className="meetingListCell meetingListObjective" data-label="Objetivo">
                  <strong>{meeting.objective}</strong>
                  <small>{meeting.needs || meeting.nextStep || "Sin detalle cargado"}</small>
                </span>
                <span className="meetingListCell" data-label="Contacto">
                  <strong>{meeting.contact || "Sin contacto"}</strong>
                  <small>{meeting.attendees || "Sin asistentes"}</small>
                </span>
                <span className="meetingListCell" data-label="Estado">
                  <span className={`statusPill ${meetingStatusClass(meeting.status)}`}>
                    {meetingStatusLabels[meeting.status]}
                  </span>
                </span>
                <span className="meetingListCell" data-label="Seguimiento">
                  <strong>{meeting.followUpDate ? formatShortDate(meeting.followUpDate) : "Sin fecha"}</strong>
                  <small>{meeting.estimatedBudget ? formatCurrency(meeting.estimatedBudget) : "Sin estimar"}</small>
                </span>
              </button>
            ))}
            {!meetings.length ? <p className="emptyPanel">No hay reuniones para los filtros actuales.</p> : null}
          </div>
        </section>
      </div>

      {selectedMeeting && typeof document !== "undefined"
        ? createPortal(
            <MeetingDetailModal
              meeting={selectedMeeting}
              onClose={() => setSelectedMeetingId(null)}
              onEdit={() => {
                onEditMeeting(selectedMeeting);
                setSelectedMeetingId(null);
              }}
              onUpdateStatus={(status) => {
                onUpdateStatus(selectedMeeting.id, status);
                setSelectedMeetingId(null);
              }}
            />,
            document.body,
          )
        : null}
    </section>
  );
}

function MeetingDetailModal({
  meeting,
  onClose,
  onEdit,
  onUpdateStatus,
}: {
  meeting: Meeting;
  onClose: () => void;
  onEdit: () => void;
  onUpdateStatus: (status: MeetingStatus) => void;
}) {
  const facts = [
    { label: "Contacto", value: meeting.contact },
    {
      label: "Presupuesto",
      value: meeting.estimatedBudget ? formatCurrency(meeting.estimatedBudget) : "",
    },
    {
      label: "Seguimiento",
      value: meeting.followUpDate ? formatShortDate(meeting.followUpDate) : "",
    },
    {
      label: "Archivos",
      value: meeting.attachments.length ? String(meeting.attachments.length) : "",
    },
    {
      label: "Aviso WhatsApp",
      value: meeting.reminderEnabled
        ? meeting.reminderSentAt
          ? `Enviado ${formatDateTime(meeting.reminderSentAt)}`
          : `${meeting.reminderMinutesBefore ?? 30} min antes`
        : "",
    },
  ].filter((item) => item.value);
  const detailBlocks = [
    { label: "Asistieron", value: meeting.attendees },
    { label: "Necesidades", value: meeting.needs },
    { label: "Equipos necesarios", value: meeting.equipmentNeeded },
    { label: "Compromisos", value: meeting.commitments },
    { label: "Proximo paso", value: meeting.nextStep },
    { label: "Notas", value: meeting.notes },
  ].filter((item) => item.value);

  return (
    <div className="deviceDetailOverlay customerProfileOverlay" onClick={onClose}>
      <section
        className="customerProfileModal meetingDetailModal"
        aria-label="Detalle de reunion"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="deviceDetailHeader">
          <div>
            <span>Seguimiento comercial</span>
            <h2>{meeting.objective}</h2>
            <p>
              {meeting.customer.name} - {formatDateTime(meeting.dateTime)}
            </p>
          </div>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Cerrar detalle">
            <X size={18} />
          </button>
        </header>

        <div className="meetingModalSummary">
          <span className={`statusPill ${meetingStatusClass(meeting.status)}`}>
            {meetingStatusLabels[meeting.status]}
          </span>
          <strong>{meetingTypeLabels[meeting.type]}</strong>
          {meeting.closeProbability ? <span>{meeting.closeProbability}% probabilidad</span> : null}
        </div>

        {facts.length ? (
          <dl className="meetingModalFacts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {detailBlocks.length ? (
          <div className="meetingDetailBlocks">
            {detailBlocks.map((block) => (
              <section key={block.label}>
                <span>{block.label}</span>
                <p>{block.value}</p>
              </section>
            ))}
          </div>
        ) : null}

        <section className="meetingModalSection">
          <span>Linea de tiempo</span>
          <MeetingTimeline meeting={meeting} />
        </section>

        {meeting.attachments.length ? (
          <section className="meetingModalSection">
            <span>Archivos adjuntos</span>
            <div className="meetingAttachmentList">
              {meeting.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.dataUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!attachment.dataUrl}
                >
                  <Paperclip size={14} />
                  <span>{attachment.name}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <div className="meetingActions">
          <button type="button" className="secondaryButton" onClick={onEdit}>
            <Edit3 size={16} />
            Editar
          </button>
          <button
            type="button"
            className="secondaryButton"
            onClick={() => onUpdateStatus("DONE")}
            disabled={meeting.status === "DONE"}
          >
            Aceptado
          </button>
          <button
            type="button"
            className="secondaryButton"
            onClick={() => onUpdateStatus("CANCELLED")}
            disabled={meeting.status === "CANCELLED"}
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}

function MeetingTimeline({ meeting }: { meeting: Meeting }) {
  const items = [
    `${formatShortDate(meeting.dateTime)} - ${meeting.objective}`,
    meeting.notes,
    meeting.commitments,
    meeting.nextStep ? `Proximo paso: ${meeting.nextStep}` : "",
    meeting.followUpDate ? `Volver a contactar: ${formatShortDate(meeting.followUpDate)}` : "",
    meeting.attachments.length ? `${meeting.attachments.length} archivo(s) adjunto(s)` : "",
  ].filter(Boolean);

  return (
    <ol className="meetingTimeline">
      {items.map((item, index) => (
        <li key={`${meeting.id}-${index}`}>{item}</li>
      ))}
    </ol>
  );
}

function WorkOrdersView({
  editingWorkOrderId,
  customers,
  inventoryItems,
  loading,
  selectedCustomerId,
  sites,
  workOrderError,
  workOrderForm,
  workOrderStats,
  workOrders,
  workSearch,
  workStatus,
  focusedWorkOrderId,
  onAddMaterial,
  onCancelEdit,
  onEditWorkOrder,
  onFormChange,
  onRefresh,
  onRemoveMaterial,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onComposeMail,
  onComposeWhatsApp,
  onOpenDocument,
  onStatusChange,
  onUpdateStatus,
}: {
  editingWorkOrderId: string | null;
  customers: Customer[];
  inventoryItems: InventoryItem[];
  loading: boolean;
  selectedCustomerId: string | null;
  sites: CustomerSite[];
  workOrderError: string;
  workOrderForm: WorkOrderPayload;
  workOrderStats: Array<{ label: string; value: number }>;
  workOrders: WorkOrder[];
  workSearch: string;
  workStatus: WorkOrderStatus | "ALL";
  focusedWorkOrderId: string | null;
  onAddMaterial: (workOrderId: string, itemId: string, quantity: number, installAsDevice: boolean) => Promise<void>;
  onCancelEdit: () => void;
  onEditWorkOrder: (workOrder: WorkOrder) => void;
  onFormChange: (form: WorkOrderPayload) => void;
  onRefresh: () => void;
  onRemoveMaterial: (movementIds: string | string[]) => Promise<void>;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onComposeMail: (workOrder: WorkOrder) => void;
  onComposeWhatsApp: (workOrder: WorkOrder) => void;
  onOpenDocument: (workOrder: WorkOrder) => void;
  onStatusChange: (value: WorkOrderStatus | "ALL") => void;
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
}) {
  const [materialForms, setMaterialForms] = useState<Record<string, { query: string; itemId: string; quantity: number; open: boolean; installAsDevice: boolean }>>({});
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const selectedWorkOrder = workOrders.find((workOrder) => workOrder.id === selectedWorkOrderId) ?? null;

  function materialForm(workOrderId: string) {
    return materialForms[workOrderId] ?? { query: "", itemId: "", quantity: 1, open: false, installAsDevice: true };
  }

  function updateMaterialForm(workOrderId: string, nextForm: { query: string; itemId: string; quantity: number; open: boolean; installAsDevice: boolean }) {
    setMaterialForms((current) => ({ ...current, [workOrderId]: nextForm }));
  }

  function materialResults(form: { query: string }) {
    const query = form.query.trim().toLowerCase();
    const source = inventoryItems;
    const matches = query
      ? source.filter((item) =>
          [item.name, item.sku, item.supplier, item.supplierCategory]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
        )
      : source;

    return matches
      .sort((left, right) => Number(right.managedStock && right.stock > 0) - Number(left.managedStock && left.stock > 0))
      .slice(0, 6);
  }

  function addReportPhotos(event: ChangeEvent<HTMLInputElement>, stage: WorkOrderReportPhoto["stage"]) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      window.alert("Solo se agregan imagenes de hasta 5 MB.");
    }

    Promise.all(
      validFiles.map(
        (file) =>
          new Promise<WorkOrderReportPhoto>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `${Date.now()}-${file.name}`,
                stage,
                name: file.name,
                dataUrl: typeof reader.result === "string" ? reader.result : "",
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then((photos) => {
      onFormChange({
        ...workOrderForm,
        reportPhotos: [...(workOrderForm.reportPhotos ?? []), ...photos.filter((photo) => photo.dataUrl)],
      });
    });
    event.target.value = "";
  }

  function removeReportPhoto(photoId?: string) {
    onFormChange({
      ...workOrderForm,
      reportPhotos: (workOrderForm.reportPhotos ?? []).filter((photo) => photo.id !== photoId),
    });
  }

  const reportBeforePhotos = (workOrderForm.reportPhotos ?? []).filter((photo) => photo.stage === "BEFORE");
  const reportAfterPhotos = (workOrderForm.reportPhotos ?? []).filter((photo) => photo.stage === "AFTER");

  return (
    <section className="workOrdersModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de trabajos">
        {workOrderStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="workOrdersLayout">
        <form className="workOrderForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>{editingWorkOrderId ? "Actualizar orden" : "Orden operativa"}</p>
              <h2>{editingWorkOrderId ? "Editar trabajo" : "Nuevo trabajo"}</h2>
            </div>
            {editingWorkOrderId ? (
              <button type="button" className="secondaryButton" onClick={onCancelEdit}>
                <X size={17} />
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="formGrid">
            <label>
              Cliente
              <select
                value={workOrderForm.customerId || selectedCustomerId || ""}
                onChange={(event) => {
                  onSelectCustomer(event.target.value);
                  onFormChange({ ...workOrderForm, customerId: event.target.value, siteId: "" });
                }}
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sitio
              <select
                value={workOrderForm.siteId}
                onChange={(event) => onFormChange({ ...workOrderForm, siteId: event.target.value })}
                disabled={!workOrderForm.customerId && !selectedCustomerId}
              >
                <option value="">Sin sitio especifico</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wideField">
              Titulo
              <input
                value={workOrderForm.title}
                onChange={(event) => onFormChange({ ...workOrderForm, title: event.target.value })}
                placeholder="Instalacion CCTV, service alarma, cambio de equipo"
              />
            </label>
            <label>
              Tipo
              <select
                value={workOrderForm.type}
                onChange={(event) => onFormChange({ ...workOrderForm, type: event.target.value as DeviceType })}
              >
                {Object.entries(deviceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={workOrderForm.status}
                onChange={(event) =>
                  onFormChange({ ...workOrderForm, status: event.target.value as WorkOrderStatus })
                }
              >
                {Object.entries(workStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="wideField">
              Fecha y hora
              <input
                type="datetime-local"
                value={workOrderForm.scheduledAt}
                onChange={(event) => onFormChange({ ...workOrderForm, scheduledAt: event.target.value })}
              />
            </label>
            <label className="wideField">
              Notas
              <textarea
                value={workOrderForm.notes}
                onChange={(event) => onFormChange({ ...workOrderForm, notes: event.target.value })}
                placeholder="Tecnico asignado, materiales, alcance, referencias del cliente"
              />
            </label>
          </div>

          <section className="workOrderReportEditor">
            <div className="sectionHeader compactHeader">
              <div>
                <p>Informe tecnico</p>
                <h3>Antes y despues</h3>
              </div>
              <span>
                {reportBeforePhotos.length} antes / {reportAfterPhotos.length} despues
              </span>
            </div>
            <div className="reportFieldGrid">
              <label className="wideField">
                Antes
                <textarea
                  value={workOrderForm.reportBeforeNotes ?? ""}
                  onChange={(event) => onFormChange({ ...workOrderForm, reportBeforeNotes: event.target.value })}
                  placeholder="Como estaba el sistema, fallas encontradas, riesgos o condiciones del lugar"
                />
              </label>
              <label className="wideField">
                Trabajo realizado
                <textarea
                  value={workOrderForm.reportTasks ?? ""}
                  onChange={(event) => onFormChange({ ...workOrderForm, reportTasks: event.target.value })}
                  placeholder="Tareas realizadas, equipos instalados, ajustes, configuraciones"
                />
              </label>
              <label className="wideField">
                Despues
                <textarea
                  value={workOrderForm.reportAfterNotes ?? ""}
                  onChange={(event) => onFormChange({ ...workOrderForm, reportAfterNotes: event.target.value })}
                  placeholder="Como quedo el trabajo terminado y que diferencia se aprecia"
                />
              </label>
              <label className="wideField">
                Pruebas tecnicas
                <textarea
                  value={workOrderForm.reportTests ?? ""}
                  onChange={(event) => onFormChange({ ...workOrderForm, reportTests: event.target.value })}
                  placeholder="Pruebas de imagen, grabacion, red, alarma, acceso, tension, comunicacion"
                />
              </label>
              <label className="wideField">
                Recomendaciones al cliente
                <textarea
                  value={workOrderForm.reportRecommendations ?? ""}
                  onChange={(event) => onFormChange({ ...workOrderForm, reportRecommendations: event.target.value })}
                  placeholder="Mantenimientos sugeridos, mejoras, cuidados, pendientes"
                />
              </label>
            </div>
            <div className="workOrderReportPhotoGrid">
              <ReportPhotoPicker
                title="Fotos antes"
                photos={reportBeforePhotos}
                onAdd={(event) => addReportPhotos(event, "BEFORE")}
                onRemove={removeReportPhoto}
              />
              <ReportPhotoPicker
                title="Fotos despues"
                photos={reportAfterPhotos}
                onAdd={(event) => addReportPhotos(event, "AFTER")}
                onRemove={removeReportPhoto}
              />
            </div>
            <div className="reportInlineActions">
              <span>Estos datos quedan guardados dentro de la orden y salen en el informe al cliente.</span>
              <button type="submit" className="secondaryButton" disabled={loading}>
                <Save size={16} />
                Guardar informe
              </button>
            </div>
          </section>

          {workOrderError ? <p className="formError">{workOrderError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            {editingWorkOrderId ? <Save size={18} /> : <Plus size={18} />}
            {editingWorkOrderId ? "Guardar cambios" : "Crear trabajo"}
          </button>
        </form>

        <section className="workOrderDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={workSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por titulo, cliente, sitio o notas"
              />
            </label>
            <select
              value={workStatus}
              onChange={(event) => onStatusChange(event.target.value as WorkOrderStatus | "ALL")}
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              {Object.entries(workStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="workOrderGrid workOrderList">
            {workOrders.map((workOrder) => {
              const form = materialForm(workOrder.id);
              const results = materialResults(form);
              const movements = workOrder.inventoryMovements ?? [];
              const groupedMovements = groupWorkOrderMaterials(movements);
              const selectedItem = inventoryItems.find((item) => item.id === form.itemId);
              const availableQuantity = selectedItem?.stock ?? 0;
              const selectedQuantity = selectedItem
                ? Math.min(Math.max(1, form.quantity), availableQuantity)
                : Math.max(1, form.quantity);
              const workOrderSiteId = workOrder.siteId ?? workOrder.site?.id ?? "";
              const installAsDevice = Boolean(form.installAsDevice);
              const reportPhotoCount = workOrder.reportPhotos?.length ?? 0;

              return (
              <article
                key={workOrder.id}
                id={`work-order-${workOrder.id}`}
                className={`workOrderCard ${workOrder.id === focusedWorkOrderId ? "focusedWorkOrderCard" : ""}`}
                onClick={() => setSelectedWorkOrderId(workOrder.id)}
              >
                <div className="workOrderCardHeader">
                  <span className={`statusPill ${workOrder.status.toLowerCase()}`}>
                    {workStatusLabels[workOrder.status]}
                  </span>
                  <strong>{workOrder.title}</strong>
                  {reportPhotoCount ? (
                    <span className="attachmentPill" title={`${reportPhotoCount} fotos adjuntas`}>
                      <Paperclip size={14} />
                      {reportPhotoCount}
                    </span>
                  ) : null}
                </div>
                <dl>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{workOrder.customer.name}</dd>
                  </div>
                  <div>
                    <dt>Sitio</dt>
                    <dd>{workOrder.site?.name ?? "Sin sitio"}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{deviceTypeLabels[workOrder.type]}</dd>
                  </div>
                  <div>
                    <dt>Agenda</dt>
                    <dd>{formatDateTime(workOrder.scheduledAt)}</dd>
                  </div>
                </dl>
                <p>{workOrder.notes || workOrder.site?.address || "Sin notas operativas"}</p>
                <div className="workOrderMaterials">
                  <div className="workOrderMaterialsHeader">
                    <strong>Materiales y equipos</strong>
                    <span>{groupedMovements.length} items</span>
                  </div>
                  {groupedMovements.length ? (
                    <div className="workOrderMaterialList">
                      {groupedMovements.map((movement) => (
                        <div key={movement.key} className="workOrderMaterialItem">
                          <span>
                            {movement.name} x{movement.quantity} {movement.unit}
                          </span>
                          <button type="button" onClick={() => onRemoveMaterial(movement.ids)} disabled={loading}>
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Sin materiales cargados.</p>
                  )}
                  <div className="workOrderMaterialForm">
                    <div className="autocompleteField">
                      <input
                        value={form.query}
                        onChange={(event) => updateMaterialForm(workOrder.id, { ...form, query: event.target.value, itemId: "", open: true })}
                        onFocus={() => updateMaterialForm(workOrder.id, { ...form, open: true })}
                        onBlur={() => window.setTimeout(() => updateMaterialForm(workOrder.id, { ...materialForm(workOrder.id), open: false }), 120)}
                        placeholder="Buscar articulo para descontar"
                        autoComplete="off"
                      />
                      {form.open ? (
                        <div className="autocompleteResults">
                          {results.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                            onClick={() =>
                              updateMaterialForm(workOrder.id, {
                                ...form,
                                query: item.name,
                                itemId: item.id,
                                quantity: Math.min(form.quantity, Math.max(1, item.stock)),
                                open: false,
                              })
                            }
                            >
                              <strong>{item.name}</strong>
                              <span>
                                {[
                                  item.sku ? `SKU ${item.sku}` : "",
                                  item.supplier,
                                  item.managedStock && item.stock > 0 ? `Disponible ${item.stock} ${item.unit}` : "Sin stock disponible",
                                ]
                                  .filter(Boolean)
                                  .join(" - ")}
                              </span>
                            </button>
                          ))}
                          {!results.length ? <p>No hay articulos relacionados.</p> : null}
                        </div>
                      ) : null}
                    </div>
                    <select
                      value={selectedItem ? selectedQuantity : ""}
                      onChange={(event) =>
                        updateMaterialForm(workOrder.id, {
                          ...form,
                          quantity: Number(event.target.value) || 1,
                        })
                      }
                      aria-label="Cantidad"
                      disabled={!selectedItem}
                    >
                      <option value="">Cant.</option>
                      {selectedItem
                        ? Array.from({ length: availableQuantity }, (_, index) => index + 1).map((quantity) => (
                            <option key={quantity} value={quantity}>
                              {quantity}
                            </option>
                          ))
                        : null}
                    </select>
                    <button
                      type="button"
                      className="secondaryButton"
                      disabled={loading || !form.itemId || !selectedItem || availableQuantity < 1}
                      onClick={async () => {
                        await onAddMaterial(workOrder.id, form.itemId, selectedQuantity, installAsDevice);
                        updateMaterialForm(workOrder.id, { query: "", itemId: "", quantity: 1, open: false, installAsDevice: form.installAsDevice });
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                  {selectedItem ? (
                    <p>
                      {selectedItem.managedStock && selectedItem.stock > 0
                        ? `Disponible: ${selectedItem.stock} ${selectedItem.unit}`
                        : "Este articulo todavia no tiene stock disponible. Primero cargale entrada en almacen."}
                    </p>
                  ) : null}
                  <label className="materialInstallToggle">
                    <input
                      type="checkbox"
                      checked={form.installAsDevice}
                      onChange={(event) => updateMaterialForm(workOrder.id, { ...form, installAsDevice: event.target.checked })}
                    />
                    Registrar como equipo instalado
                  </label>
                  {form.installAsDevice && !workOrderSiteId ? (
                    <p>Sin sitio: se creara uno predeterminado con el nombre del cliente.</p>
                  ) : !workOrderSiteId ? (
                    <p>Sin sitio: si no marcas equipo instalado, solo descuenta stock.</p>
                  ) : null}
                </div>
                <div className="workOrderActions">
                  {workOrder.status === "COMPLETED" ? (
                  <button type="button" className="secondaryButton" onClick={() => onOpenDocument(workOrder)}>
                      <FileText size={16} />
                      Orden/PDF
                    </button>
                  ) : null}
                  <button type="button" className="secondaryButton" onClick={(event) => {
                    event.stopPropagation();
                    onEditWorkOrder(workOrder);
                  }}>
                    <Edit3 size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={(event) => {
                      event.stopPropagation();
                      onUpdateStatus(workOrder.id, "IN_PROGRESS");
                    }}
                    disabled={workOrder.status === "IN_PROGRESS" || workOrder.status === "COMPLETED"}
                  >
                    En curso
                  </button>
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={(event) => {
                      event.stopPropagation();
                      onUpdateStatus(workOrder.id, "COMPLETED");
                    }}
                    disabled={workOrder.status === "COMPLETED"}
                  >
                    Completar
                  </button>
                </div>
              </article>
              );
            })}
            {!workOrders.length ? <p className="emptyPanel">No hay trabajos para los filtros actuales.</p> : null}
          </div>
          {selectedWorkOrder && typeof document !== "undefined" ? createPortal((() => {
            const form = materialForm(selectedWorkOrder.id);
            const results = materialResults(form);
            const groupedMovements = groupWorkOrderMaterials(selectedWorkOrder.inventoryMovements ?? []);
            const selectedItem = inventoryItems.find((item) => item.id === form.itemId);
            const availableQuantity = selectedItem?.stock ?? 0;
            const selectedQuantity = selectedItem
              ? Math.min(Math.max(1, form.quantity), availableQuantity)
              : Math.max(1, form.quantity);
            const workOrderSiteId = selectedWorkOrder.siteId ?? selectedWorkOrder.site?.id ?? "";
            const installAsDevice = Boolean(form.installAsDevice);
            const quoteSummary = parseWorkOrderQuoteNotes(selectedWorkOrder.notes);
            const operationalNotes = quoteSummary ? selectedWorkOrder.site?.address : selectedWorkOrder.notes || selectedWorkOrder.site?.address;
            const reportPhotos = selectedWorkOrder.reportPhotos ?? [];
            const detailBeforePhotos = reportPhotos.filter((photo) => photo.stage === "BEFORE");
            const detailAfterPhotos = reportPhotos.filter((photo) => photo.stage === "AFTER");
            const hasTechnicalReport = Boolean(
              selectedWorkOrder.reportBeforeNotes ||
                selectedWorkOrder.reportAfterNotes ||
                selectedWorkOrder.reportTasks ||
                selectedWorkOrder.reportTests ||
                selectedWorkOrder.reportRecommendations ||
                reportPhotos.length,
            );

            return (
              <div className="deviceDetailOverlay customerProfileOverlay" onClick={() => setSelectedWorkOrderId(null)}>
                <section className="customerProfileModal workOrderDetailModal" aria-label="Detalle del trabajo" onClick={(event) => event.stopPropagation()}>
                  <header className="deviceDetailHeader">
                    <div>
                      <span>Orden de trabajo</span>
                      <h2>{selectedWorkOrder.title}</h2>
                      <p>
                        {[selectedWorkOrder.customer.name, selectedWorkOrder.site?.name, deviceTypeLabels[selectedWorkOrder.type]]
                          .filter(Boolean)
                          .join(" - ")}
                      </p>
                    </div>
                    <div className="documentToolbarActions">
                      <button type="button" className="secondaryButton" onClick={() => onComposeWhatsApp(selectedWorkOrder)}>
                        <MessageSquare size={16} />
                        WhatsApp
                      </button>
                      <button type="button" className="secondaryButton" onClick={() => onComposeMail(selectedWorkOrder)}>
                        <Mail size={16} />
                        Mail
                      </button>
                      {selectedWorkOrder.status === "COMPLETED" ? (
                        <button type="button" className="secondaryButton" onClick={() => onOpenDocument(selectedWorkOrder)}>
                          <FileText size={16} />
                          Orden/PDF
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="secondaryButton"
                        onClick={() => {
                          onEditWorkOrder(selectedWorkOrder);
                          setSelectedWorkOrderId(null);
                        }}
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                      <button type="button" className="iconButton" onClick={() => setSelectedWorkOrderId(null)} aria-label="Cerrar orden">
                        <X size={18} />
                      </button>
                    </div>
                  </header>

                  <div className="workOrderScheduleBand">
                    <div className={`workOrderStatusBadge status-${selectedWorkOrder.status.toLowerCase()}`}>
                      {workStatusLabels[selectedWorkOrder.status]}
                    </div>
                    <div>
                      <span>Programado</span>
                      <strong>{formatDateTime(selectedWorkOrder.scheduledAt)}</strong>
                    </div>
                    <div>
                      <span>Sitio</span>
                      <strong>{selectedWorkOrder.site?.name ?? "Sin sitio"}</strong>
                    </div>
                    <div>
                      <span>Servicio</span>
                      <strong>{deviceTypeLabels[selectedWorkOrder.type]}</strong>
                    </div>
                  </div>

                  <dl className="customerProfileGrid">
                    <div>
                      <dt>Cliente</dt>
                      <dd>{selectedWorkOrder.customer.name}</dd>
                    </div>
                    <div>
                      <dt>Direccion</dt>
                      <dd>{selectedWorkOrder.site?.address ?? "Sin direccion cargada"}</dd>
                    </div>
                  </dl>

                  {quoteSummary ? (
                    <section className="workOrderQuoteSummary">
                      <div className="workOrderQuoteSummaryHeader">
                        <div>
                          <span>Presupuesto de origen</span>
                          <strong>{quoteSummary.number}</strong>
                        </div>
                        {quoteSummary.total ? <strong>{quoteSummary.total}</strong> : null}
                      </div>
                      <div className="workOrderQuoteFacts">
                        {quoteSummary.executionTime ? (
                          <div>
                            <span>Tiempo estimado</span>
                            <strong>{quoteSummary.executionTime}</strong>
                          </div>
                        ) : null}
                        {quoteSummary.warranty ? (
                          <div>
                            <span>Garantia</span>
                            <strong>{quoteSummary.warranty}</strong>
                          </div>
                        ) : null}
                        {quoteSummary.paymentTerms ? (
                          <div>
                            <span>Forma de pago</span>
                            <strong>{quoteSummary.paymentTerms}</strong>
                          </div>
                        ) : null}
                        {quoteSummary.commercialTerms ? (
                          <div>
                            <span>Condiciones</span>
                            <strong>{quoteSummary.commercialTerms}</strong>
                          </div>
                        ) : null}
                      </div>
                      <div className="workOrderApprovedItems">
                        <span>Items aprobados</span>
                        {quoteSummary.items.length ? (
                          quoteSummary.items.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)
                        ) : (
                          <p>Sin items detallados.</p>
                        )}
                      </div>
                    </section>
                  ) : (
                    <p className="workOrderDetailNotes">{operationalNotes || "Sin notas operativas"}</p>
                  )}

                  <section className="workOrderTechnicalReport">
                    <div className="workOrderMaterialsHeader">
                      <strong>Informe tecnico</strong>
                      <span>{hasTechnicalReport ? "Cargado" : "Pendiente"}</span>
                    </div>
                    {hasTechnicalReport ? (
                      <>
                        <div className="technicalReportGrid">
                          {selectedWorkOrder.reportBeforeNotes ? (
                            <article>
                              <span>Antes</span>
                              <p>{selectedWorkOrder.reportBeforeNotes}</p>
                            </article>
                          ) : null}
                          {selectedWorkOrder.reportTasks ? (
                            <article>
                              <span>Trabajo realizado</span>
                              <p>{selectedWorkOrder.reportTasks}</p>
                            </article>
                          ) : null}
                          {selectedWorkOrder.reportAfterNotes ? (
                            <article>
                              <span>Despues</span>
                              <p>{selectedWorkOrder.reportAfterNotes}</p>
                            </article>
                          ) : null}
                          {selectedWorkOrder.reportTests ? (
                            <article>
                              <span>Pruebas</span>
                              <p>{selectedWorkOrder.reportTests}</p>
                            </article>
                          ) : null}
                          {selectedWorkOrder.reportRecommendations ? (
                            <article>
                              <span>Recomendaciones</span>
                              <p>{selectedWorkOrder.reportRecommendations}</p>
                            </article>
                          ) : null}
                        </div>
                        <div className="technicalReportPhotos">
                          <ReportPhotoPreview title="Antes" photos={detailBeforePhotos} />
                          <ReportPhotoPreview title="Despues" photos={detailAfterPhotos} />
                        </div>
                      </>
                    ) : (
                      <p>Sin informe cargado. Toca Editar para agregar fotos e informacion tecnica.</p>
                    )}
                  </section>

                  <div className="workOrderMaterials">
                    <div className="workOrderMaterialsHeader">
                      <strong>Materiales y equipos</strong>
                      <span>{groupedMovements.length} items</span>
                    </div>
                    {groupedMovements.length ? (
                      <div className="workOrderMaterialList">
                        {groupedMovements.map((movement) => (
                          <div key={movement.key} className="workOrderMaterialItem">
                            <span>{movement.name} x{movement.quantity} {movement.unit}</span>
                            <button type="button" onClick={() => onRemoveMaterial(movement.ids)} disabled={loading}>
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Sin materiales cargados.</p>
                    )}
                    <div className="workOrderMaterialForm">
                      <div className="autocompleteField">
                        <input
                          value={form.query}
                          onChange={(event) => updateMaterialForm(selectedWorkOrder.id, { ...form, query: event.target.value, itemId: "", open: true })}
                          onFocus={() => updateMaterialForm(selectedWorkOrder.id, { ...form, open: true })}
                          onBlur={() => window.setTimeout(() => updateMaterialForm(selectedWorkOrder.id, { ...materialForm(selectedWorkOrder.id), open: false }), 120)}
                          placeholder="Buscar articulo para descontar"
                          autoComplete="off"
                        />
                        {form.open ? (
                          <div className="autocompleteResults">
                            {results.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() =>
                                  updateMaterialForm(selectedWorkOrder.id, {
                                    ...form,
                                    query: item.name,
                                    itemId: item.id,
                                    quantity: Math.min(form.quantity, Math.max(1, item.stock)),
                                    open: false,
                                  })
                                }
                              >
                                <strong>{item.name}</strong>
                                <span>
                                  {[
                                    item.sku ? `SKU ${item.sku}` : "",
                                    item.supplier,
                                    item.managedStock && item.stock > 0 ? `Disponible ${item.stock} ${item.unit}` : "Sin stock disponible",
                                  ]
                                    .filter(Boolean)
                                    .join(" - ")}
                                </span>
                              </button>
                            ))}
                            {!results.length ? <p>No hay articulos relacionados.</p> : null}
                          </div>
                        ) : null}
                      </div>
                      <select
                        value={selectedItem ? selectedQuantity : ""}
                        onChange={(event) =>
                          updateMaterialForm(selectedWorkOrder.id, {
                            ...form,
                            quantity: Number(event.target.value) || 1,
                          })
                        }
                        aria-label="Cantidad"
                        disabled={!selectedItem}
                      >
                        <option value="">Cant.</option>
                        {selectedItem
                          ? Array.from({ length: availableQuantity }, (_, index) => index + 1).map((quantity) => (
                              <option key={quantity} value={quantity}>
                                {quantity}
                              </option>
                            ))
                          : null}
                      </select>
                      <button
                        type="button"
                        className="secondaryButton"
                        disabled={loading || !form.itemId || !selectedItem || availableQuantity < 1}
                        onClick={async () => {
                          await onAddMaterial(selectedWorkOrder.id, form.itemId, selectedQuantity, installAsDevice);
                          updateMaterialForm(selectedWorkOrder.id, { query: "", itemId: "", quantity: 1, open: false, installAsDevice: form.installAsDevice });
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                    {selectedItem ? (
                      <p>
                        {selectedItem.managedStock && selectedItem.stock > 0
                          ? `Disponible: ${selectedItem.stock} ${selectedItem.unit}`
                          : "Este articulo todavia no tiene stock disponible. Primero cargale entrada en almacen."}
                      </p>
                    ) : null}
                    <label className="materialInstallToggle">
                      <input
                        type="checkbox"
                        checked={form.installAsDevice}
                        onChange={(event) => updateMaterialForm(selectedWorkOrder.id, { ...form, installAsDevice: event.target.checked })}
                      />
                      Registrar como equipo instalado
                    </label>
                    {form.installAsDevice && !workOrderSiteId ? (
                      <p>Sin sitio: se creara uno predeterminado con el nombre del cliente.</p>
                    ) : !workOrderSiteId ? (
                      <p>Sin sitio: si no marcas equipo instalado, solo descuenta stock.</p>
                    ) : null}
                  </div>

                  <div className="workOrderActions">
                    <button
                      type="button"
                      className="secondaryButton"
                      onClick={() => onUpdateStatus(selectedWorkOrder.id, "IN_PROGRESS")}
                      disabled={selectedWorkOrder.status === "IN_PROGRESS" || selectedWorkOrder.status === "COMPLETED"}
                    >
                      En curso
                    </button>
                    <button
                      type="button"
                      className="secondaryButton"
                      onClick={() => onUpdateStatus(selectedWorkOrder.id, "COMPLETED")}
                      disabled={selectedWorkOrder.status === "COMPLETED"}
                    >
                      Completar
                    </button>
                  </div>
                </section>
              </div>
            );
          })(), document.body) : null}
        </section>
      </div>
    </section>
  );
}

function ReportPhotoPicker({
  title,
  photos,
  onAdd,
  onRemove,
}: {
  title: string;
  photos: WorkOrderReportPhoto[];
  onAdd: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (photoId?: string) => void;
}) {
  return (
    <section className="reportPhotoPicker">
      <div>
        <div>
          <strong>{title}</strong>
          <span>{photos.length} fotos</span>
        </div>
        <label className="secondaryButton">
          <Paperclip size={16} />
          Agregar
          <input type="file" accept="image/*" multiple onChange={onAdd} />
        </label>
      </div>
      {photos.length ? (
        <div className="reportPhotoThumbGrid">
          {photos.map((photo, index) => (
            <figure key={photo.id ?? `${photo.name}-${index}`}>
              <img src={photo.dataUrl} alt={photo.name} />
              <figcaption>{photo.name}</figcaption>
              <button type="button" onClick={() => onRemove(photo.id)} aria-label="Eliminar foto" title="Eliminar foto">
                <X size={15} />
                <span>Eliminar</span>
              </button>
            </figure>
          ))}
        </div>
      ) : (
        <p>Sin fotos cargadas.</p>
      )}
    </section>
  );
}

function ReportPhotoPreview({ title, photos }: { title: string; photos: WorkOrderReportPhoto[] }) {
  return (
    <section>
      <strong>{title}</strong>
      {photos.length ? (
        <div className="reportPhotoThumbGrid">
          {photos.map((photo, index) => (
            <figure key={photo.id ?? `${photo.name}-${index}`}>
              <img src={photo.dataUrl} alt={photo.name} />
              <figcaption>{photo.name}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p>Sin fotos.</p>
      )}
    </section>
  );
}

function QuotesView({
  customers,
  editingQuoteId,
  loading,
  quoteError,
  quoteForm,
  quoteLaborPreview,
  inventoryItems,
  priceBookItems,
  quoteSearch,
  quoteStats,
  quoteStatus,
  quotes,
  onAccept,
  onCancelEdit,
  onComposeMail,
  onComposeWhatsApp,
  onEditQuote,
  onFormChange,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onStatusChange,
}: {
  customers: Customer[];
  editingQuoteId: string | null;
  loading: boolean;
  quoteError: string;
  quoteForm: QuotePayload;
  quoteLaborPreview: LaborPointCalculation | null;
  inventoryItems: InventoryItem[];
  priceBookItems: PriceBookItem[];
  quoteSearch: string;
  quoteStats: Array<{ label: string; value: number | string }>;
  quoteStatus: "ALL" | QuoteStatus;
  quotes: Quote[];
  onAccept: (id: string, scheduledAt?: string) => void;
  onCancelEdit: () => void;
  onComposeMail: (quote: Quote) => void;
  onComposeWhatsApp: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onFormChange: (form: QuotePayload) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onStatusChange: (value: "ALL" | QuoteStatus) => void;
}) {
  const quoteItems = quoteForm.items ?? [];
  const catalogSubtotal = quoteItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const manualSubtotal = quoteForm.pricingMode === "MANUAL" ? Number(quoteForm.subtotal) || 0 : 0;
  const laborSubtotal = quoteForm.pricingMode === "THIRD_PARTY" ? quoteLaborPreview?.subtotal ?? 0 : 0;
  const subtotal = catalogSubtotal + manualSubtotal + laborSubtotal;
  const normalizedDiscountPercent = Math.min(100, Math.max(0, Number(quoteForm.discountPercent) || 0));
  const rawDiscountAmount = Number(quoteForm.discountAmount);
  const discount = Math.min(
    subtotal,
    Math.max(0, Number.isFinite(rawDiscountAmount) ? rawDiscountAmount : subtotal * (normalizedDiscountPercent / 100)),
  );
  const displayedDiscountPercent = Math.round(normalizedDiscountPercent * 100) / 100;
  const taxableBase = Math.max(0, subtotal - discount);
  const taxEnabled = quoteForm.taxIncluded !== false;
  const tax = taxEnabled ? taxableBase * 0.22 : 0;
  const total = taxableBase + tax;
  const selectedQuoteCustomer = customers.find((customer) => customer.id === quoteForm.customerId) ?? null;
  const [quoteCustomerQuery, setQuoteCustomerQuery] = useState(selectedQuoteCustomer?.name ?? "");
  const [quoteCustomerOpen, setQuoteCustomerOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogQuantity, setCatalogQuantity] = useState(1);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<QuoteCatalogOption | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [catalogUnitPrice, setCatalogUnitPrice] = useState<number>(0);
  const [laborDescription, setLaborDescription] = useState("");
  const [laborUnitPrice, setLaborUnitPrice] = useState<number>(0);
  const [quoteExchangeRate, setQuoteExchangeRate] = useState("40");
  const [quoteExecutionAt, setQuoteExecutionAt] = useState("");
  const [discountAmountValue, setDiscountAmountValue] = useState("0");
  const [editingDiscountAmount, setEditingDiscountAmount] = useState(false);
  const [travelKilometers, setTravelKilometers] = useState<number>(0);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(88.67);
  const [fuelKmPerLiter, setFuelKmPerLiter] = useState<number>(10);
  const [fuelUpdating, setFuelUpdating] = useState(false);
  const [fuelMessage, setFuelMessage] = useState("Nafta Super Uruguay");
  const quoteCurrency = (quoteForm.currency || "UYU").toUpperCase();
  const normalizedExchangeRate = Math.max(0, Number(quoteExchangeRate) || 0);
  const estimatedFuelLiters = fuelKmPerLiter > 0 ? travelKilometers / fuelKmPerLiter : 0;
  const travelCostUyu = Math.round(Math.max(0, estimatedFuelLiters * fuelPricePerLiter) * 100) / 100;
  const travelCost = convertBetweenQuoteCurrencies(travelCostUyu, "UYU", quoteCurrency);
  const normalizedQuoteCustomerQuery = quoteCustomerQuery.trim().toLowerCase();
  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId) ?? null;
  const quoteCustomerResults = customers
    .filter((customer) => {
      if (quoteForm.pricingMode === "THIRD_PARTY") {
        return customer.type === "THIRD_PARTY";
      }

      if (quoteForm.pricingMode === "DIRECT") {
        return customer.type !== "THIRD_PARTY";
      }

      return true;
    })
    .filter((customer) => {
      if (!normalizedQuoteCustomerQuery) {
        return true;
      }

      return [customer.name, customer.reference, customer.legalName, customer.taxId, customer.phone, customer.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuoteCustomerQuery));
    })
    .slice(0, 8);

  useEffect(() => {
    setQuoteCustomerQuery(selectedQuoteCustomer?.name ?? "");
  }, [selectedQuoteCustomer?.id, selectedQuoteCustomer?.name]);

  useEffect(() => {
    setQuoteExecutionAt("");
  }, [selectedQuote?.id]);

  useEffect(() => {
    if (editingDiscountAmount) {
      return;
    }

    const roundedDiscount = Math.round(discount * 100) / 100;
    setDiscountAmountValue(String(roundedDiscount));
  }, [discount, editingDiscountAmount]);

  useEffect(() => {
    if (selectedCatalogItem?.source === "INVENTORY") {
      const inventoryItem = inventoryItems.find((item) => item.id === selectedCatalogItem.id);
      const priceWithTax = Number(inventoryItem?.priceWithTax ?? inventoryItem?.costPrice ?? 0) || 0;
      const netPrice = quoteForm.taxIncluded === false ? priceWithTax : priceWithTax / 1.22;
      setCatalogUnitPrice(convertQuotePrice(netPrice, inventoryItem?.currency));
    } else if (selectedCatalogItem?.source === "PRICE_BOOK") {
      const priceBookItem = priceBookItems.find((item) => item.id === selectedCatalogItem.id);
      setCatalogUnitPrice(convertQuotePrice(Number(priceBookItem?.salePrice ?? 0) || 0, priceBookItem?.currency));
    }
  }, [inventoryItems, priceBookItems, quoteCurrency, normalizedExchangeRate, quoteForm.taxIncluded, selectedCatalogItem?.id, selectedCatalogItem?.source]);

  useEffect(() => {
    refreshFuelPrice();
  }, []);

  function convertQuotePrice(amount: number, sourceCurrency?: string | null) {
    const source = (sourceCurrency || quoteCurrency).toUpperCase();
    let converted = amount;

    if (source !== quoteCurrency && normalizedExchangeRate > 0) {
      if (source === "USD" && quoteCurrency === "UYU") {
        converted = amount * normalizedExchangeRate;
      } else if (source === "UYU" && quoteCurrency === "USD") {
        converted = amount / normalizedExchangeRate;
      }
    }

    return Math.round(converted * 100) / 100;
  }

  function convertBetweenQuoteCurrencies(amount: number, fromCurrency: string, toCurrency: string) {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to || normalizedExchangeRate <= 0) {
      return Math.round(amount * 100) / 100;
    }

    if (from === "USD" && to === "UYU") {
      return Math.round(amount * normalizedExchangeRate * 100) / 100;
    }

    if (from === "UYU" && to === "USD") {
      return Math.round((amount / normalizedExchangeRate) * 100) / 100;
    }

    return Math.round(amount * 100) / 100;
  }

  function convertQuoteItemsCurrency(items: NonNullable<QuotePayload["items"]>, fromCurrency: string, toCurrency: string) {
    return items.map((item) => ({
      ...item,
      unitPrice: convertBetweenQuoteCurrencies(Number(item.unitPrice) || 0, fromCurrency, toCurrency),
      unitCost: convertBetweenQuoteCurrencies(Number(item.unitCost) || 0, fromCurrency, toCurrency),
    }));
  }

  function toCatalogQuantity(value: string) {
    return Math.max(1, Math.floor(Number(value) || 1));
  }

  function normalizeDecimalInput(value: string) {
    const clean = value.replace(",", ".").replace(/[^\d.]/g, "");
    const [integer = "", ...decimalParts] = clean.split(".");
    const integerWithoutLeadingZeros = integer.replace(/^0+(?=\d)/, "");
    const decimal = decimalParts.join("");
    return decimalParts.length ? `${integerWithoutLeadingZeros || "0"}.${decimal}` : integerWithoutLeadingZeros;
  }

  function updateDiscountPercent(value: string) {
    const nextPercent = Math.min(100, Math.max(0, Number(value) || 0));
    const nextAmount = Math.round(subtotal * (nextPercent / 100) * 100) / 100;
    setDiscountAmountValue(String(nextAmount));
    onFormChange({ ...quoteForm, discountPercent: nextPercent, discountAmount: nextAmount });
  }

  function updateDiscountAmount(value: string) {
    const normalizedValue = normalizeDecimalInput(value);
    setDiscountAmountValue(normalizedValue);
    const nextAmount = Math.min(subtotal, Math.max(0, Number(normalizedValue) || 0));
    const nextPercent = subtotal > 0 ? (nextAmount / subtotal) * 100 : 0;
    onFormChange({ ...quoteForm, discountPercent: nextPercent, discountAmount: nextAmount });
  }

  function finishDiscountAmountEdit() {
    setEditingDiscountAmount(false);
    const normalizedValue = normalizeDecimalInput(discountAmountValue);
    const nextAmount = Math.min(subtotal, Math.max(0, Number(normalizedValue) || 0));
    const roundedAmount = Math.round(nextAmount * 100) / 100;
    const nextPercent = subtotal > 0 ? (roundedAmount / subtotal) * 100 : 0;
    setDiscountAmountValue(String(roundedAmount));
    onFormChange({ ...quoteForm, discountPercent: nextPercent, discountAmount: roundedAmount });
  }

  function selectQuoteCustomer(customer: Customer) {
    setQuoteCustomerQuery(customer.name);
    setQuoteCustomerOpen(false);
    onSelectCustomer(customer.id);
    onFormChange({ ...quoteForm, customerId: customer.id });
  }

  function updateQuoteCustomerQuery(value: string) {
    setQuoteCustomerQuery(value);
    setQuoteCustomerOpen(true);
    const cleanValue = value.trim().toLowerCase();
    const exactCustomer = customers.find((customer) => customer.name.toLowerCase() === cleanValue || customer.reference.toLowerCase() === cleanValue);

    if (exactCustomer) {
      onSelectCustomer(exactCustomer.id);
      onFormChange({ ...quoteForm, customerId: exactCustomer.id });
      return;
    }

    onFormChange({ ...quoteForm, customerId: "" });
  }

  const normalizedCatalogQuery = catalogQuery.trim().toLowerCase();
  const catalogModeItems: QuoteCatalogOption[] =
    quoteForm.pricingMode === "THIRD_PARTY"
      ? priceBookItems
          .filter((item) => item.code.startsWith("SEGURA-PUNTAS-") || item.category.toLowerCase().includes("puntas"))
          .map((item) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            type: item.type,
            category: item.category,
            description: item.description,
            unit: item.unit || "unidad",
            unitPrice: convertQuotePrice(Number(item.salePrice) || 0, item.currency),
            unitCost: convertQuotePrice(Number(item.costPrice) || 0, item.currency),
            taxRate: Number(item.taxRate) || 22,
            currency: quoteCurrency,
            source: "PRICE_BOOK" as const,
          }))
      : inventoryItems.map((item) => {
          const priceWithTax = Number(item.priceWithTax ?? item.costPrice ?? 0) || 0;
          const netPrice = quoteForm.taxIncluded === false ? priceWithTax : priceWithTax / 1.22;
          return {
            id: item.id,
            code: item.sku || item.reference,
            name: item.name,
            type: "EQUIPMENT" as QuoteItemType,
            category: item.supplierCategory || (item.category ? deviceTypeLabels[item.category] : "Almacén"),
            description: [item.supplier, item.supplierCategory, item.notes].filter(Boolean).join(" - "),
            unit: item.unit || "unidad",
            unitPrice: convertQuotePrice(netPrice, item.currency),
            unitCost: convertQuotePrice(Number(item.costPrice ?? 0) || 0, item.currency),
            taxRate: 22,
            currency: quoteCurrency,
            source: "INVENTORY" as const,
          };
        });
  const catalogResults = catalogModeItems
    .filter((item) => {
      if (!normalizedCatalogQuery) {
        return true;
      }

      return [item.code, item.name, item.category, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedCatalogQuery));
    })
    .slice(0, 10);

  function selectCatalogItem(item: QuoteCatalogOption) {
    setSelectedCatalogItem(item);
    setCatalogQuery(item.name);
    setCatalogUnitPrice(Number(item.unitPrice) || 0);
    setCatalogOpen(false);
  }

  function addCatalogItem() {
    if (!selectedCatalogItem) {
      return;
    }

    const nextItem: NonNullable<QuotePayload["items"]>[number] = {
      priceBookItemId: selectedCatalogItem.source === "PRICE_BOOK" ? selectedCatalogItem.id : undefined,
      type: selectedCatalogItem.type,
      category: selectedCatalogItem.category,
      description: selectedCatalogItem.name,
      quantity: toCatalogQuantity(String(catalogQuantity)),
      unit: selectedCatalogItem.unit || "unidad",
      unitPrice: Number(catalogUnitPrice) || 0,
      taxRate: Number(selectedCatalogItem.taxRate) || 22,
      unitCost: Number(selectedCatalogItem.unitCost) || 0,
    };

    onFormChange({ ...quoteForm, items: [...quoteItems, nextItem], subtotal: 0 });
    setSelectedCatalogItem(null);
    setCatalogQuery("");
    setCatalogUnitPrice(0);
    setCatalogQuantity(1);
  }

  function addLaborItem() {
    const description = laborDescription.trim() || "Mano de obra";
    const unitPrice = Number(laborUnitPrice) || 0;

    if (unitPrice <= 0) {
      return;
    }

    const nextItem: NonNullable<QuotePayload["items"]>[number] = {
      type: "LABOR",
      category: "Mano de obra",
      description,
      quantity: 1,
      unit: "servicio",
      unitPrice,
      taxRate: 22,
      unitCost: 0,
    };

    onFormChange({ ...quoteForm, items: [...quoteItems, nextItem], subtotal: 0 });
    setLaborDescription("");
    setLaborUnitPrice(0);
  }

  async function refreshFuelPrice() {
    setFuelUpdating(true);
    try {
      const fuel = await apiRequest<{ pricePerLiter: number; updatedAt?: string; fallback?: boolean }>("/api/fuel/uy-super");
      const nextPrice = Number(fuel.pricePerLiter) || 88.67;
      setFuelPricePerLiter(Math.round(nextPrice * 100) / 100);
      setFuelMessage(fuel.fallback ? "Valor de respaldo editable" : "Valor oficial actualizado");
    } catch {
      setFuelMessage("No se pudo actualizar; podes editarlo manualmente");
    } finally {
      setFuelUpdating(false);
    }
  }

  function addTravelExpenseItem() {
    if (travelKilometers <= 0 || fuelKmPerLiter <= 0 || fuelPricePerLiter <= 0 || travelCost <= 0) {
      return;
    }

    const nextItem: NonNullable<QuotePayload["items"]>[number] = {
      type: "EXPENSE",
      category: "Combustible",
      description: `Combustible Nafta Super - ${travelKilometers} km recorridos`,
      quantity: 1,
      unit: "recorrido",
      unitPrice: travelCost,
      taxRate: 22,
      unitCost: travelCost,
    };

    onFormChange({ ...quoteForm, items: [...quoteItems, nextItem], subtotal: 0 });
  }

  function printQuoteDetail() {
    if (typeof document === "undefined") {
      window.print();
      return;
    }

    const cleanup = () => {
      document.body.classList.remove("printingCustomerProfile");
      document.body.classList.remove("printingQuoteDetail");
      window.removeEventListener("afterprint", cleanup);
    };

    document.body.classList.add("printingCustomerProfile");
    document.body.classList.add("printingQuoteDetail");
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 60000);
  }

  async function downloadQuoteTemplate(quote: Quote) {
    await downloadQuoteTemplatePdf(quote);
  }

  function removeQuoteItem(index: number) {
    onFormChange({ ...quoteForm, items: quoteItems.filter((_, itemIndex) => itemIndex !== index) });
  }

  function setPricingMode(pricingMode: QuotePricingMode) {
    const keepsCustomer =
      pricingMode === "THIRD_PARTY"
        ? selectedQuoteCustomer?.type === "THIRD_PARTY"
        : pricingMode === "DIRECT"
          ? selectedQuoteCustomer?.type !== "THIRD_PARTY"
          : true;

    if (!keepsCustomer) {
      setQuoteCustomerQuery("");
    }
    setSelectedCatalogItem(null);
    setCatalogQuery("");
    setCatalogUnitPrice(0);

    onFormChange({
      ...quoteForm,
      customerId: keepsCustomer ? quoteForm.customerId : "",
      pricingMode,
      laborPoints: pricingMode === "THIRD_PARTY" ? quoteForm.laborPoints : 0,
      subtotal: pricingMode === "MANUAL" ? quoteForm.subtotal : 0,
      items: pricingMode === quoteForm.pricingMode ? quoteForm.items : [],
    });
  }

  return (
    <section className="quotesModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de presupuestos">
        {quoteStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="quotesLayout">
        <form className="quoteForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>Comercial</p>
              <h2>{editingQuoteId ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>
            </div>
            {editingQuoteId ? (
              <button type="button" className="secondaryButton" onClick={onCancelEdit}>
                <X size={16} />
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="formGrid">
            <div className="wideField quoteModeSelector">
              <span>Modalidad de presupuesto</span>
              <div>
                {[
                  { value: "DIRECT", label: "Security Solutions", detail: "Catálogo propio" },
                  { value: "THIRD_PARTY", label: "Tercerizado", detail: "Tarifa por cliente" },
                  { value: "MANUAL", label: "Manual", detail: "Importe libre" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    className={quoteForm.pricingMode === mode.value ? "active" : ""}
                    onClick={() => setPricingMode(mode.value as QuotePricingMode)}
                  >
                    <strong>{mode.label}</strong>
                    <small>{mode.detail}</small>
                  </button>
                ))}
              </div>
            </div>

            <label>
              Cliente
              <div className="autocompleteField">
                <input
                  value={quoteCustomerQuery}
                  onChange={(event) => updateQuoteCustomerQuery(event.target.value)}
                  onFocus={() => setQuoteCustomerOpen(true)}
                  onBlur={() => window.setTimeout(() => setQuoteCustomerOpen(false), 120)}
                  placeholder="Escribir cliente o tercerizado"
                  autoComplete="off"
                />
                {quoteCustomerOpen ? (
                  <div className="autocompleteResults">
                    {quoteCustomerResults.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectQuoteCustomer(customer)}
                      >
                        <strong>{customer.name}</strong>
                        <span>
                          {[
                            customer.type === "THIRD_PARTY" ? "Tercerizado" : "Cliente",
                            customer.reference,
                            customer.phone,
                            customer.taxId,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        </span>
                      </button>
                    ))}
                    {!quoteCustomerResults.length ? <p>No hay clientes con ese nombre.</p> : null}
                  </div>
                ) : null}
              </div>
            </label>
            <label>
              Numero
              <input
                value={quoteForm.number}
                onChange={(event) => onFormChange({ ...quoteForm, number: event.target.value })}
                placeholder="Automatico"
              />
            </label>
            <label className="wideField">
              Titulo
              <input
                value={quoteForm.title}
                onChange={(event) => onFormChange({ ...quoteForm, title: event.target.value })}
                placeholder="Instalacion CCTV, kit alarma, mantenimiento anual"
              />
            </label>
            <label>
              Servicio
              <select
                value={quoteForm.service || "CCTV"}
                onChange={(event) => onFormChange({ ...quoteForm, service: event.target.value as DeviceType })}
              >
                {Object.entries(deviceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Moneda
              <select
                value={quoteForm.currency || "UYU"}
                onChange={(event) => {
                  const nextCurrency = event.target.value;
                  const convertedItems = convertQuoteItemsCurrency(quoteItems, quoteCurrency, nextCurrency);
                  setSelectedCatalogItem(null);
                  setCatalogQuery("");
                  setCatalogUnitPrice(0);
                  onFormChange({
                    ...quoteForm,
                    currency: nextCurrency,
                    items: convertedItems,
                    subtotal:
                      quoteForm.pricingMode === "MANUAL"
                        ? convertBetweenQuoteCurrencies(Number(quoteForm.subtotal) || 0, quoteCurrency, nextCurrency)
                        : quoteForm.subtotal,
                  });
                }}
              >
                <option value="UYU">UYU</option>
                <option value="USD">USD</option>
              </select>
            </label>
            {quoteForm.pricingMode === "DIRECT" ? (
              <label>
                Tipo de cambio USD/UYU
                <input
                  type="text"
                  inputMode="decimal"
                  value={quoteExchangeRate}
                  onChange={(event) => {
                    setQuoteExchangeRate(normalizeDecimalInput(event.target.value));
                    setSelectedCatalogItem(null);
                    setCatalogQuery("");
                    setCatalogUnitPrice(0);
                  }}
                  placeholder="Ej: 40"
                />
              </label>
            ) : null}
            {quoteForm.pricingMode === "THIRD_PARTY" ? (
              <label>
                Puntas adicionales
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={quoteForm.laborPoints}
                  onChange={(event) => onFormChange({ ...quoteForm, laborPoints: Number(event.target.value) })}
                  placeholder="Cantidad de puntas"
                />
              </label>
            ) : null}
            {quoteForm.pricingMode === "THIRD_PARTY" && quoteLaborPreview ? (
              <div className="quoteTotalBox">
                <span>{quoteLaborPreview.source === "CUSTOMER" ? "Tarifa del cliente" : "Tarifa Security Solutions"}</span>
                <strong>
                  {formatCurrency(quoteLaborPreview.pointValue)} x punta
                </strong>
                <small>
                  {quoteLaborPreview.rateName} - {formatCurrency(quoteLaborPreview.subtotal)} sin IVA
                </small>
              </div>
            ) : null}
            {quoteForm.pricingMode === "DIRECT" || quoteForm.pricingMode === "THIRD_PARTY" ? (
              <div className="wideField quoteCatalogBuilder">
                <span>{quoteForm.pricingMode === "THIRD_PARTY" ? "Catálogo tercerizado Segura" : "Catálogo de Almacén"}</span>
                <div className="quoteCatalogControls">
                  <div className="autocompleteField">
                    <input
                      value={catalogQuery}
                      onChange={(event) => {
                        setCatalogQuery(event.target.value);
                        setSelectedCatalogItem(null);
                        setCatalogOpen(true);
                      }}
                      onFocus={() => setCatalogOpen(true)}
                      onBlur={() => window.setTimeout(() => setCatalogOpen(false), 120)}
                      placeholder={quoteForm.pricingMode === "THIRD_PARTY" ? "Buscar servicio por puntas" : "Buscar en Almacén por equipo, SKU o importador"}
                      autoComplete="off"
                    />
                    {catalogOpen ? (
                      <div className="autocompleteResults">
                        {catalogResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectCatalogItem(item)}
                          >
                            <strong>{item.name}</strong>
                            <span>
                              {[item.code, item.category, item.description, formatPrice(item.unitPrice, item.currency)].filter(Boolean).join(" - ")}
                            </span>
                          </button>
                        ))}
                        {!catalogResults.length ? <p>No hay ítems con ese texto.</p> : null}
                      </div>
                    ) : null}
                  </div>
                  <label className="inlineCatalogField">
                    Cantidad
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={catalogQuantity}
                      onChange={(event) => setCatalogQuantity(toCatalogQuantity(event.target.value))}
                      aria-label="Cantidad"
                    />
                  </label>
                  {quoteForm.pricingMode === "DIRECT" ? (
                    <label className="inlineCatalogField">
                      Precio unit. ({quoteCurrency})
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={catalogUnitPrice}
                        onChange={(event) => setCatalogUnitPrice(Number(event.target.value) || 0)}
                        aria-label="Precio unitario"
                      />
                    </label>
                  ) : null}
                  <button type="button" className="secondaryButton" onClick={addCatalogItem} disabled={!selectedCatalogItem}>
                    Agregar
                  </button>
                </div>
                {quoteForm.pricingMode === "DIRECT" ? (
                  <>
                    <span>Mano de obra Security Solutions</span>
                    <div className="quoteCatalogControls quoteLaborControls">
                      <label className="inlineCatalogField">
                        Importe ({quoteCurrency})
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={laborUnitPrice}
                          onChange={(event) => setLaborUnitPrice(Number(event.target.value) || 0)}
                        />
                      </label>
                      <button type="button" className="secondaryButton" onClick={addLaborItem} disabled={Number(laborUnitPrice) <= 0}>
                        Agregar mano de obra
                      </button>
                      <label className="inlineCatalogField laborDescriptionField">
                        Descripcion
                        <input
                          value={laborDescription}
                          onChange={(event) => setLaborDescription(event.target.value)}
                          placeholder="Ej: Instalacion, configuracion, puesta en marcha"
                        />
                      </label>
                    </div>
                  </>
                ) : null}
                <span>Recorrido / combustible</span>
                <div className="quoteCatalogControls quoteTravelControls">
                  <label className="inlineCatalogField">
                    Km recorridos
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={travelKilometers}
                      onChange={(event) => setTravelKilometers(Math.max(0, Number(event.target.value) || 0))}
                    />
                  </label>
                  <label className="inlineCatalogField">
                    Km por litro
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={fuelKmPerLiter}
                      onChange={(event) => setFuelKmPerLiter(Math.max(0, Number(event.target.value) || 0))}
                    />
                  </label>
                  <label className="inlineCatalogField">
                    Nafta Super (UYU/L)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fuelPricePerLiter}
                      onChange={(event) => setFuelPricePerLiter(Math.max(0, Number(event.target.value) || 0))}
                    />
                  </label>
                  <div className="quoteTravelSummary">
                    <Fuel size={18} />
                    <div>
                      <strong>{formatPrice(travelCost, quoteCurrency)}</strong>
                      <span>
                        {estimatedFuelLiters.toFixed(2)} L - {fuelMessage}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="secondaryButton" onClick={refreshFuelPrice} disabled={fuelUpdating}>
                    <RefreshCw size={16} className={fuelUpdating ? "spin" : ""} />
                    Actualizar precio
                  </button>
                  <button type="button" className="secondaryButton" onClick={addTravelExpenseItem} disabled={travelCost <= 0}>
                    Agregar combustible
                  </button>
                </div>
                {quoteItems.length ? (
                  <div className="quoteItemList">
                    {quoteItems.map((item, index) => (
                      <article key={`${item.description}-${index}`}>
                        <div>
                          <strong>{item.description}</strong>
                          <span>
                            {item.quantity} {item.unit} x {formatPrice(item.unitPrice, quoteCurrency)}
                          </span>
                        </div>
                        <b>{formatPrice((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), quoteCurrency)}</b>
                        <button type="button" className="iconButton" onClick={() => removeQuoteItem(index)} aria-label="Quitar ítem">
                          <X size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <label>
              Subtotal
              <input
                type="number"
                min="0"
                step="0.01"
                value={quoteForm.pricingMode === "MANUAL" ? quoteForm.subtotal : Math.round(subtotal * 100) / 100}
                onChange={(event) => {
                  const nextSubtotal = Number(event.target.value);
                  onFormChange({
                    ...quoteForm,
                    subtotal: nextSubtotal,
                  });
                }}
                disabled={quoteForm.pricingMode !== "MANUAL"}
              />
            </label>
            <label>
              Descuento %
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={displayedDiscountPercent}
                onChange={(event) => updateDiscountPercent(event.target.value)}
              />
            </label>
            <label>
              Ajuste monto ({quoteCurrency})
              <input
                type="text"
                inputMode="decimal"
                value={discountAmountValue}
                onFocus={() => setEditingDiscountAmount(true)}
                onBlur={finishDiscountAmountEdit}
                onChange={(event) => updateDiscountAmount(event.target.value)}
              />
            </label>
            <label>
              Margen %
              <input
                type="number"
                min="0"
                step="0.01"
                value={quoteForm.profitMarginPercent}
                onChange={(event) => onFormChange({ ...quoteForm, profitMarginPercent: Number(event.target.value) })}
              />
            </label>
            <label>
              IVA
              <select
                value={quoteForm.taxIncluded === false ? "NO" : "YES"}
                onChange={(event) =>
                  onFormChange({
                    ...quoteForm,
                    taxIncluded: event.target.value === "YES",
                    tax: event.target.value === "YES" ? undefined : 0,
                  })
                }
              >
                <option value="YES">Aplicar IVA 22%</option>
                <option value="NO">Sin IVA</option>
              </select>
            </label>
            <label className="wideField">
              Condiciones comerciales
              <textarea
                value={quoteForm.commercialTerms}
                onChange={(event) => onFormChange({ ...quoteForm, commercialTerms: event.target.value })}
                placeholder="Validez, alcance, condiciones de aceptacion"
              />
            </label>
            <label>
              Tiempo de ejecucion
              <input
                value={quoteForm.executionTime}
                onChange={(event) => onFormChange({ ...quoteForm, executionTime: event.target.value })}
                placeholder="Ej: 2 dias habiles"
              />
            </label>
            <label>
              Garantia
              <input
                value={quoteForm.warranty}
                onChange={(event) => onFormChange({ ...quoteForm, warranty: event.target.value })}
                placeholder="Ej: 12 meses"
              />
            </label>
            <label className="wideField">
              Forma de pago
              <input
                value={quoteForm.paymentTerms}
                onChange={(event) => onFormChange({ ...quoteForm, paymentTerms: event.target.value })}
                placeholder="Entrega, saldo contra instalacion, transferencia"
              />
            </label>
            <div className="quoteTotalBox">
              <span>Total</span>
              <strong>{formatPrice(total, quoteCurrency)}</strong>
            </div>
          </div>

          {quoteError ? <p className="formError">{quoteError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            {editingQuoteId ? <Save size={18} /> : <Plus size={18} />}
            {editingQuoteId ? "Guardar cambios" : "Crear presupuesto"}
          </button>
        </form>

        <section className="quoteDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={quoteSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por numero, titulo o cliente"
              />
            </label>
            <select
              value={quoteStatus}
              onChange={(event) => onStatusChange(event.target.value as "ALL" | QuoteStatus)}
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              {Object.entries(quoteStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="quoteGrid quoteList">
            {quotes.map((quote) => (
              <article key={quote.id} className="quoteCard" onClick={() => setSelectedQuoteId(quote.id)}>
                <div className="quoteCardHeader">
                  <span className={`statusPill ${quote.status === "APPROVED" ? "completed" : quote.status === "REJECTED" ? "cancelled" : "scheduled"}`}>
                    {quoteStatusLabels[quote.status]}
                  </span>
                  <strong>{quote.number}</strong>
                </div>
                <p>{quote.title}</p>
                <dl>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{quote.customer.name}</dd>
                  </div>
                  <div>
                    <dt>Servicio</dt>
                    <dd>{deviceTypeLabels[quote.service]}</dd>
                  </div>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(quote.subtotal, quote.currency)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatPrice(quote.total, quote.currency)}</dd>
                  </div>
                </dl>
              </article>
            ))}
            {!quotes.length ? <p className="emptyPanel">No hay presupuestos para los filtros actuales.</p> : null}
          </div>

          {selectedQuote && typeof document !== "undefined"
            ? createPortal(
                <div className="deviceDetailOverlay customerProfileOverlay" onClick={() => setSelectedQuoteId(null)}>
                  <section
                    className="customerProfileModal printableCustomerProfile quoteDetailModal"
                    aria-label="Detalle del presupuesto"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <img className="customerProfilePrintWatermark" src="/security-solutions-logo-bw.png" alt="" aria-hidden="true" />
                    <header className="deviceDetailHeader">
                      <div className="printCompanyIdentity" aria-hidden="true">
                        <img src="/security-solutions-logo.png" alt="" />
                        <div>
                          <strong>Security Solutions</strong>
                          <span>Presupuesto comercial</span>
                        </div>
                      </div>
                      <div className="customerProfileTitleBlock">
                        <span>Presupuesto</span>
                        <h2>{selectedQuote.title}</h2>
                        <p>
                          {[selectedQuote.number, selectedQuote.customer.name, quoteStatusLabels[selectedQuote.status], selectedQuote.currency]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      </div>
                      <div className="documentToolbarActions">
                        <button
                          type="button"
                          className="secondaryButton printHidden"
                          onClick={() => {
                            onEditQuote(selectedQuote);
                            setSelectedQuoteId(null);
                          }}
                        >
                          <Edit3 size={16} />
                          Editar
                        </button>
                        <button type="button" className="secondaryButton printHidden" onClick={printQuoteDetail}>
                          <Printer size={16} />
                          Imprimir
                        </button>
                        <button type="button" className="secondaryButton printHidden" onClick={() => void downloadQuoteTemplate(selectedQuote)}>
                          <FileText size={16} />
                          Descargar PDF
                        </button>
                        <button type="button" className="secondaryButton" onClick={() => onComposeWhatsApp(selectedQuote)}>
                          <MessageSquare size={16} />
                          WhatsApp
                        </button>
                        <button type="button" className="secondaryButton" onClick={() => onComposeMail(selectedQuote)}>
                          <Mail size={16} />
                          Mail
                        </button>
                        <button
                          type="button"
                          className="secondaryButton"
                          onClick={() => onAccept(selectedQuote.id, quoteExecutionAt ? new Date(quoteExecutionAt).toISOString() : undefined)}
                          disabled={selectedQuote.status === "APPROVED"}
                        >
                          <Save size={16} />
                          Aprobar
                        </button>
                        <button type="button" className="iconButton printHidden" onClick={() => setSelectedQuoteId(null)} aria-label="Cerrar presupuesto">
                          <X size={18} />
                        </button>
                      </div>
                    </header>

                    <section className="customerProfileSection quoteApprovalSection printHidden">
                      <label className="fieldGroup">
                        Dia y hora de ejecucion
                        <input
                          type="datetime-local"
                          value={quoteExecutionAt}
                          onChange={(event) => setQuoteExecutionAt(event.target.value)}
                        />
                      </label>
                      <p>Al aprobar, se crea una orden de trabajo y queda programada en Agenda con esta fecha y hora.</p>
                    </section>

                    <dl className="customerProfileGrid">
                      <div>
                        <dt>Cliente</dt>
                        <dd>{selectedQuote.customer.name}</dd>
                      </div>
                      <div>
                        <dt>Servicio</dt>
                        <dd>{deviceTypeLabels[selectedQuote.service]}</dd>
                      </div>
                      <div>
                        <dt>Estado</dt>
                        <dd>{quoteStatusLabels[selectedQuote.status]}</dd>
                      </div>
                      <div>
                        <dt>Moneda</dt>
                        <dd>{selectedQuote.currency}</dd>
                      </div>
                      <div>
                        <dt>Emision</dt>
                        <dd>{formatDateTime(selectedQuote.issueDate)}</dd>
                      </div>
                      <div>
                        <dt>Vencimiento</dt>
                        <dd>{selectedQuote.validUntil ? formatDateTime(selectedQuote.validUntil) : "Sin fecha"}</dd>
                      </div>
                      <div>
                        <dt>IVA</dt>
                        <dd>{selectedQuote.taxIncluded ? "Aplicado" : "Sin IVA"}</dd>
                      </div>
                      <div>
                        <dt>Margen</dt>
                        <dd>{toMoneyNumber(selectedQuote.estimatedMargin).toFixed(2)}%</dd>
                      </div>
                    </dl>

                    <section className="customerProfileSection">
                      <div className="customerProfileSectionHeader">
                        <h3>Materiales</h3>
                      </div>
                      <div className="quoteDetailItems">
                        {(selectedQuote.items ?? []).map((item, index) => (
                          <article key={item.id ?? `${item.description}-${index}`}>
                            <div>
                              <strong>{item.description}</strong>
                            </div>
                            <span>{item.quantity} {item.unit}</span>
                            <span>{formatPrice(item.unitPrice, selectedQuote.currency)}</span>
                            <b>{formatPrice(item.subtotal ?? (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), selectedQuote.currency)}</b>
                          </article>
                        ))}
                        {!selectedQuote.items?.length ? <p className="emptyPanel">Sin materiales cargados.</p> : null}
                      </div>
                    </section>

                    <section className="customerProfileSection">
                      <div className="customerProfileSectionHeader">
                        <h3>Condiciones</h3>
                      </div>
                      <dl className="customerProfileGrid">
                        <div>
                          <dt>Tiempo de ejecucion</dt>
                          <dd>{formatQuoteTerm(selectedQuote.executionTime, "dia")}</dd>
                        </div>
                        <div>
                          <dt>Garantia</dt>
                          <dd>{formatQuoteTerm(selectedQuote.warranty, "mes")}</dd>
                        </div>
                        <div>
                          <dt>Forma de pago</dt>
                          <dd>{selectedQuote.paymentTerms || "Sin definir"}</dd>
                        </div>
                        <div>
                          <dt>Condiciones comerciales</dt>
                          <dd>{selectedQuote.commercialTerms || "Sin condiciones"}</dd>
                        </div>
                      </dl>
                    </section>

                    <section className="customerProfileSection">
                      <div className="customerProfileSectionHeader">
                        <h3>Totales</h3>
                      </div>
                      <dl className="customerProfileGrid quoteTotalsGrid">
                        <div>
                          <dt>Materiales</dt>
                          <dd>{formatPrice(selectedQuote.materialsSubtotal, selectedQuote.currency)}</dd>
                        </div>
                        <div>
                          <dt>Mano de obra</dt>
                          <dd>{formatPrice(selectedQuote.laborSubtotal, selectedQuote.currency)}</dd>
                        </div>
                        <div>
                          <dt>Gastos</dt>
                          <dd>{formatPrice(selectedQuote.expensesSubtotal, selectedQuote.currency)}</dd>
                        </div>
                        <div>
                          <dt>Subtotal</dt>
                          <dd>{formatPrice(selectedQuote.subtotal, selectedQuote.currency)}</dd>
                        </div>
                        <div>
                          <dt>Descuento</dt>
                          <dd>{formatPrice(selectedQuote.discountAmount, selectedQuote.currency)}</dd>
                        </div>
                        <div>
                          <dt>IVA</dt>
                          <dd>{formatPrice(selectedQuote.tax, selectedQuote.currency)}</dd>
                        </div>
                        <div className="quoteTotalHighlight">
                          <dt>Total</dt>
                          <dd>{formatPrice(selectedQuote.total, selectedQuote.currency)}</dd>
                        </div>
                        <div>
                          <dt>Ganancia estimada</dt>
                          <dd>{formatPrice(selectedQuote.estimatedProfit, selectedQuote.currency)}</dd>
                        </div>
                      </dl>
                    </section>

                    {selectedQuote.history?.length ? (
                      <section className="customerProfileSection printHidden">
                        <div className="customerProfileSectionHeader">
                          <h3>Historial</h3>
                        </div>
                        <div className="movementList inventoryDetailMovements">
                          {selectedQuote.history.map((entry) => (
                            <span key={entry.id}>
                              {formatDateTime(entry.createdAt)} - {entry.comment || entry.action}
                            </span>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </section>
                </div>,
                document.body,
              )
            : null}
        </section>
      </div>
    </section>
  );
}

function PaymentsView({
  customers,
  loading,
  paymentError,
  paymentForm,
  paymentSearch,
  paymentStats,
  paymentStatus,
  payments,
  selectedCustomerId,
  onFormChange,
  onMarkPaid,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onStatusChange,
}: {
  customers: Customer[];
  loading: boolean;
  paymentError: string;
  paymentForm: PaymentPayload;
  paymentSearch: string;
  paymentStats: Array<{ label: string; value: number | string }>;
  paymentStatus: "ALL" | "PENDING" | "PAID" | "OVERDUE";
  payments: Payment[];
  selectedCustomerId: string | null;
  onFormChange: (form: PaymentPayload) => void;
  onMarkPaid: (id: string) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onStatusChange: (value: "ALL" | "PENDING" | "PAID" | "OVERDUE") => void;
}) {
  return (
    <section className="paymentsModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de cobros">
        {paymentStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="paymentsLayout">
        <form className="paymentForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>Finanzas</p>
              <h2>Nuevo cobro</h2>
            </div>
          </div>

          <div className="formGrid">
            <label>
              Cliente
              <select
                value={paymentForm.customerId || selectedCustomerId || ""}
                onChange={(event) => {
                  onSelectCustomer(event.target.value);
                  onFormChange({ ...paymentForm, customerId: event.target.value });
                }}
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Importe
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.amount}
                onChange={(event) => onFormChange({ ...paymentForm, amount: Number(event.target.value) })}
              />
            </label>
            <label className="wideField">
              Concepto
              <input
                value={paymentForm.concept}
                onChange={(event) => onFormChange({ ...paymentForm, concept: event.target.value })}
                placeholder="Entrega presupuesto, saldo instalacion, mantenimiento mensual"
              />
            </label>
            <label>
              Vencimiento
              <input
                type="date"
                value={paymentForm.dueDate}
                onChange={(event) => onFormChange({ ...paymentForm, dueDate: event.target.value })}
              />
            </label>
            <label>
              Fecha de pago
              <input
                type="date"
                value={paymentForm.paidAt}
                onChange={(event) => onFormChange({ ...paymentForm, paidAt: event.target.value })}
              />
            </label>
          </div>

          {paymentError ? <p className="formError">{paymentError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            <Plus size={18} />
            Crear cobro
          </button>
        </form>

        <section className="paymentDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={paymentSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por concepto o cliente"
              />
            </label>
            <select
              value={paymentStatus}
              onChange={(event) => onStatusChange(event.target.value as "ALL" | "PENDING" | "PAID" | "OVERDUE")}
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="OVERDUE">Vencidos</option>
              <option value="PAID">Pagados</option>
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="paymentGrid">
            {payments.map((payment) => (
              <article key={payment.id} className="paymentCard">
                <div className="paymentCardHeader">
                  <span className={`statusPill ${paymentStatusClass(payment)}`}>
                    {paymentStatusLabel(payment)}
                  </span>
                  <strong>{formatCurrency(payment.amount)}</strong>
                </div>
                <h3>{payment.concept}</h3>
                <dl>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{payment.customer.name}</dd>
                  </div>
                  <div>
                    <dt>Vence</dt>
                    <dd>{formatShortDate(payment.dueDate)}</dd>
                  </div>
                  <div>
                    <dt>Pago</dt>
                    <dd>{payment.paidAt ? formatShortDate(payment.paidAt) : "Pendiente"}</dd>
                  </div>
                </dl>
                <div className="paymentActions">
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => onMarkPaid(payment.id)}
                    disabled={Boolean(payment.paidAt)}
                  >
                    <Save size={16} />
                    Marcar pago
                  </button>
                </div>
              </article>
            ))}
            {!payments.length ? <p className="emptyPanel">No hay cobros para los filtros actuales.</p> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

function VehiclesView({
  loading,
  token,
  vehicleError,
  vehicleForm,
  vehicleSearch,
  vehicleStats,
  vehicleStatus,
  vehicles,
  onFormChange,
  onRefresh,
  onSave,
  onSearchChange,
  onStatusChange,
  onDelete,
  onToggleActive,
}: {
  loading: boolean;
  token?: string | null;
  vehicleError: string;
  vehicleForm: VehiclePayload;
  vehicleSearch: string;
  vehicleStats: Array<{ label: string; value: number }>;
  vehicleStatus: "ALL" | "ACTIVE" | "INACTIVE";
  vehicles: Vehicle[];
  onFormChange: (form: VehiclePayload) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | "ACTIVE" | "INACTIVE") => void;
  onDelete: (vehicle: Vehicle) => void;
  onToggleActive: (vehicle: Vehicle) => void;
}) {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [traccarSettings, setTraccarSettings] = useState<TraccarSettings | null>(null);
  const [traccarForm, setTraccarForm] = useState({
    baseUrl: "",
    token: "",
    username: "",
    password: "",
    matchRadiusMeters: 120,
    minStopMinutes: 5,
    companyName: "Security Solutions",
    companyAddress: "",
    companyLatitude: undefined as number | undefined,
    companyLongitude: undefined as number | undefined,
  });
  const [traccarDate, setTraccarDate] = useState(today);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicleDetailId, setSelectedVehicleDetailId] = useState<string | null>(null);
  const [vehicleDaily, setVehicleDaily] = useState<VehicleDailySummary | null>(null);
  const [geofenceSync, setGeofenceSync] = useState<TraccarGeofenceSync | null>(null);
  const [traccarLoading, setTraccarLoading] = useState(false);
  const [traccarError, setTraccarError] = useState("");
  const selectedVehicleDetail = vehicles.find((vehicle) => vehicle.id === selectedVehicleDetailId) ?? null;

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    apiRequest<TraccarSettings>("/api/vehicles/traccar/settings", { token })
      .then((settings) => {
        if (!active) {
          return;
        }
        setTraccarSettings(settings);
        setTraccarForm({
          baseUrl: settings.baseUrl ?? "",
          token: settings.token ?? "",
          username: settings.username ?? "",
          password: settings.password ?? "",
          matchRadiusMeters: Number(settings.matchRadiusMeters) || 120,
          minStopMinutes: Number(settings.minStopMinutes) || 5,
          companyName: settings.companyName ?? "Security Solutions",
          companyAddress: settings.companyAddress ?? "",
          companyLatitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLatitude) : undefined,
          companyLongitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLongitude) : undefined,
        });
      })
      .catch((error) => {
        if (active) {
          setTraccarError(`No se pudo cargar Traccar: ${getErrorMessage(error)}`);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedVehicleId && vehicles.length) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [selectedVehicleId, vehicles]);

  async function saveTraccarSettings() {
    if (!token) {
      return;
    }

    const normalizedCoordinates = normalizeCompanyCoordinates(traccarForm.companyLatitude, traccarForm.companyLongitude);
    if (!normalizedCoordinates) {
      setTraccarError("Coordenadas invalidas. En Uruguay usa latitud -34.xxxxxx y longitud -56.xxxxxx.");
      return;
    }

    setTraccarLoading(true);
    setTraccarError("");
    try {
      const settings = await apiRequest<TraccarSettings>("/api/vehicles/traccar/settings", {
        token,
        method: "PATCH",
        body: JSON.stringify({
          ...traccarForm,
          matchRadiusMeters: Number(traccarForm.matchRadiusMeters) || 120,
          minStopMinutes: Number(traccarForm.minStopMinutes) || 5,
          companyLatitude: normalizedCoordinates.latitude,
          companyLongitude: normalizedCoordinates.longitude,
        }),
      });
      setTraccarSettings(settings);
      setTraccarForm({
        baseUrl: settings.baseUrl ?? "",
        token: settings.token ?? "",
        username: settings.username ?? "",
        password: settings.password ?? "",
        matchRadiusMeters: Number(settings.matchRadiusMeters) || 120,
        minStopMinutes: Number(settings.minStopMinutes) || 5,
        companyName: settings.companyName ?? "Security Solutions",
        companyAddress: settings.companyAddress ?? "",
        companyLatitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLatitude) : undefined,
        companyLongitude: hasCoordinates(settings.companyLatitude, settings.companyLongitude) ? Number(settings.companyLongitude) : undefined,
      });
    } catch (error) {
      setTraccarError(`No se pudo guardar Traccar: ${getErrorMessage(error)}`);
    } finally {
      setTraccarLoading(false);
    }
  }

  async function loadVehicleDaily(vehicleId = selectedVehicleId) {
    if (!token || !vehicleId) {
      return;
    }

    setSelectedVehicleId(vehicleId);
    setTraccarLoading(true);
    setTraccarError("");
    try {
      const data = await apiRequest<VehicleDailySummary>(
        `/api/vehicles/${vehicleId}/traccar/daily?date=${encodeURIComponent(traccarDate)}`,
        { token },
      );
      setVehicleDaily(data);
    } catch (error) {
      setTraccarError(`No se pudo generar el resumen GPS: ${getErrorMessage(error)}`);
    } finally {
      setTraccarLoading(false);
    }
  }

  async function syncGeofences() {
    if (!token) {
      return;
    }

    setTraccarLoading(true);
    setTraccarError("");
    try {
      const data = await apiRequest<TraccarGeofenceSync>("/api/vehicles/traccar/geofences/sync", {
        token,
        method: "POST",
      });
      setGeofenceSync(data);
    } catch (error) {
      setTraccarError(`No se pudieron sincronizar geozonas: ${getErrorMessage(error)}`);
    } finally {
      setTraccarLoading(false);
    }
  }

  return (
    <section className="vehiclesModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de vehiculos">
        {vehicleStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="vehiclesLayout">
        <form className="vehicleForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>Flota</p>
              <h2>Nuevo vehiculo</h2>
            </div>
          </div>

          <div className="formGrid">
            <label className="wideField">
              Nombre
              <input
                value={vehicleForm.name}
                onChange={(event) => onFormChange({ ...vehicleForm, name: event.target.value })}
                placeholder="Movil 1, Tecnico zona este, Camioneta instalacion"
              />
            </label>
            <label>
              Matricula
              <input
                value={vehicleForm.plate}
                onChange={(event) => onFormChange({ ...vehicleForm, plate: event.target.value })}
                placeholder="ABC 1234"
              />
            </label>
            <label>
              ID Traccar
              <input
                value={vehicleForm.traccarDeviceId}
                onChange={(event) => onFormChange({ ...vehicleForm, traccarDeviceId: event.target.value })}
                placeholder="ID del dispositivo GPS"
              />
            </label>
            <label>
              Consumo km/l
              <input
                type="number"
                min="0"
                step="0.1"
                value={vehicleForm.fuelKmPerLiter ?? 10}
                onChange={(event) => onFormChange({ ...vehicleForm, fuelKmPerLiter: Number(event.target.value) || 0 })}
                placeholder="Ej: 10"
              />
            </label>
            <label className="toggleField wideField">
              <input
                type="checkbox"
                checked={Boolean(vehicleForm.active)}
                onChange={(event) => onFormChange({ ...vehicleForm, active: event.target.checked })}
              />
              Vehiculo activo
            </label>
          </div>

          {vehicleError ? <p className="formError">{vehicleError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            <Plus size={18} />
            Registrar vehiculo
          </button>
        </form>

        <section className="vehicleDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={vehicleSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por nombre, matricula o ID Traccar"
              />
            </label>
            <select
              value={vehicleStatus}
              onChange={(event) => onStatusChange(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="vehicleList" role="list">
            {vehicles.length ? (
              <div className="vehicleListHeader" aria-hidden="true">
                <span>Vehiculo</span>
                <span>Matricula</span>
                <span>Traccar</span>
                <span>Consumo</span>
                <span>Estado</span>
                <span>Actualizado</span>
              </div>
            ) : null}
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                className="vehicleListRow"
                onClick={() => {
                  setSelectedVehicleDetailId(vehicle.id);
                  setSelectedVehicleId(vehicle.id);
                  setVehicleDaily(null);
                  setTraccarError("");
                }}
              >
                <span className="vehicleListCell" data-label="Vehiculo">
                  <strong>{vehicle.name}</strong>
                  <small>{vehicle.traccarDeviceId ? "GPS vinculado" : "Sin GPS vinculado"}</small>
                </span>
                <span className="vehicleListCell" data-label="Matricula">
                  <strong>{vehicle.plate || "Sin matricula"}</strong>
                </span>
                <span className="vehicleListCell" data-label="Traccar">
                  <strong>{vehicle.traccarDeviceId || "Sin vincular"}</strong>
                </span>
                <span className="vehicleListCell" data-label="Consumo">
                  <strong>{vehicle.fuelKmPerLiter ? `${formatNumber(Number(vehicle.fuelKmPerLiter))} km/l` : "Sin dato"}</strong>
                </span>
                <span className="vehicleListCell" data-label="Estado">
                  <span className={`statusPill ${vehicle.active ? "completed" : "inactive"}`}>
                    {vehicle.active ? "Activo" : "Inactivo"}
                  </span>
                </span>
                <span className="vehicleListCell" data-label="Actualizado">
                  <strong>{formatShortDate(vehicle.updatedAt)}</strong>
                </span>
              </button>
            ))}
            {!vehicles.length ? <p className="emptyPanel">No hay vehiculos para los filtros actuales.</p> : null}
          </div>
        </section>
      </div>

      <section className="traccarPanel">
        <div className="sectionHeader compactHeader">
          <div>
            <p>Seguimiento GPS</p>
            <h2>Control Traccar</h2>
          </div>
          <span className={`statusPill ${traccarSettings?.configured ? "completed" : "pending"}`}>
            {traccarSettings?.configured ? "Configurado" : "Pendiente"}
          </span>
        </div>

        <div className="traccarConfigGrid">
          <label className="wideField">
            URL Traccar
            <input
              value={traccarForm.baseUrl}
              onChange={(event) => setTraccarForm((form) => ({ ...form, baseUrl: event.target.value }))}
              placeholder="https://tu-traccar.com"
            />
          </label>
          <label>
            Token
            <input
              value={traccarForm.token}
              onChange={(event) => setTraccarForm((form) => ({ ...form, token: event.target.value }))}
              placeholder="Token o ********"
            />
          </label>
          <label>
            Usuario
            <input
              value={traccarForm.username}
              onChange={(event) => setTraccarForm((form) => ({ ...form, username: event.target.value }))}
              placeholder="Opcional"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={traccarForm.password}
              onChange={(event) => setTraccarForm((form) => ({ ...form, password: event.target.value }))}
              placeholder="Opcional"
            />
          </label>
          <label>
            Radio visita (m)
            <input
              type="number"
              min="20"
              value={traccarForm.matchRadiusMeters}
              onChange={(event) => setTraccarForm((form) => ({ ...form, matchRadiusMeters: Number(event.target.value) || 120 }))}
            />
          </label>
          <label>
            Min. parada
            <input
              type="number"
              min="1"
              value={traccarForm.minStopMinutes}
              onChange={(event) => setTraccarForm((form) => ({ ...form, minStopMinutes: Number(event.target.value) || 5 }))}
            />
          </label>
          <label>
            Empresa / base
            <input
              value={traccarForm.companyName}
              onChange={(event) => setTraccarForm((form) => ({ ...form, companyName: event.target.value }))}
              placeholder="Security Solutions"
            />
          </label>
          <label className="wideField">
            Ubicacion de salida
            <input
              value={traccarForm.companyAddress}
              onChange={(event) => {
                const companyAddress = event.target.value;
                const coords = parseCoordinatesFromText(companyAddress);
                setTraccarForm((form) => ({
                  ...form,
                  companyAddress,
                  companyLatitude: coords?.latitude ?? form.companyLatitude,
                  companyLongitude: coords?.longitude ?? form.companyLongitude,
                }));
              }}
              placeholder="Direccion o enlace de Google Maps de la empresa"
            />
          </label>
          <label>
            Latitud base
            <input
              type="number"
              step="0.000001"
              value={traccarForm.companyLatitude ?? ""}
              onChange={(event) =>
                setTraccarForm((form) => ({
                  ...form,
                  companyLatitude: event.target.value === "" ? undefined : Number(event.target.value),
                }))
              }
              placeholder="-34.901112"
            />
          </label>
          <label>
            Longitud base
            <input
              type="number"
              step="0.000001"
              value={traccarForm.companyLongitude ?? ""}
              onChange={(event) =>
                setTraccarForm((form) => ({
                  ...form,
                  companyLongitude: event.target.value === "" ? undefined : Number(event.target.value),
                }))
              }
              placeholder="-56.164532"
            />
          </label>
          <button type="button" className="primaryButton" onClick={saveTraccarSettings} disabled={traccarLoading}>
            <Save size={18} />
            Guardar Traccar
          </button>
          <button type="button" className="secondaryButton traccarSyncButton" onClick={syncGeofences} disabled={traccarLoading}>
            <MapPin size={18} />
            Sincronizar geozonas
          </button>
        </div>

        {traccarError ? <p className="formError">{traccarError}</p> : null}
        {geofenceSync ? (
          <div className="traccarSyncSummary">
            <article>
              <span>Nuevas</span>
              <strong>{geofenceSync.created}</strong>
            </article>
            <article>
              <span>Actualizadas</span>
              <strong>{geofenceSync.updated}</strong>
            </article>
            <article>
              <span>Vinculos GPS</span>
              <strong>{geofenceSync.linked}</strong>
            </article>
            <article>
              <span>Sin coordenadas</span>
              <strong>{geofenceSync.skipped}</strong>
            </article>
            <p>{geofenceSync.message}</p>
          </div>
        ) : null}
        <p className="emptyPanel">Toca un vehiculo de la lista para abrir el resumen GPS y las acciones.</p>
      </section>

      {selectedVehicleDetail && typeof document !== "undefined"
        ? createPortal(
            <VehicleDetailModal
              date={traccarDate}
              error={traccarError}
              loading={traccarLoading}
              summary={vehicleDaily}
              vehicle={selectedVehicleDetail}
              onClose={() => setSelectedVehicleDetailId(null)}
              onDateChange={setTraccarDate}
              onDelete={() => {
                setSelectedVehicleDetailId(null);
                onDelete(selectedVehicleDetail);
              }}
              onLoadSummary={() => loadVehicleDaily(selectedVehicleDetail.id)}
              onToggleActive={() => onToggleActive(selectedVehicleDetail)}
            />,
            document.body,
          )
        : null}
    </section>
  );
}

function VehicleDetailModal({
  date,
  error,
  loading,
  summary,
  vehicle,
  onClose,
  onDateChange,
  onDelete,
  onLoadSummary,
  onToggleActive,
}: {
  date: string;
  error: string;
  loading: boolean;
  summary: VehicleDailySummary | null;
  vehicle: Vehicle;
  onClose: () => void;
  onDateChange: (value: string) => void;
  onDelete: () => void;
  onLoadSummary: () => void;
  onToggleActive: () => void;
}) {
  return (
    <div className="deviceDetailOverlay customerProfileOverlay" onClick={onClose}>
      <section className="customerProfileModal vehicleDetailModal" aria-label="Detalle del vehiculo" onClick={(event) => event.stopPropagation()}>
        <header className="deviceDetailHeader">
          <div>
            <span>Vehiculo</span>
            <h2>{vehicle.name}</h2>
            <p>
              {vehicle.plate || "Sin matricula"} - Traccar {vehicle.traccarDeviceId || "sin vincular"}
            </p>
          </div>
          <button type="button" className="iconButton" onClick={onClose} aria-label="Cerrar detalle">
            <X size={18} />
          </button>
        </header>

        <div className="vehicleDetailFacts">
          <article>
            <span>Estado</span>
            <strong>{vehicle.active ? "Activo" : "Inactivo"}</strong>
          </article>
          <article>
            <span>Consumo</span>
            <strong>{vehicle.fuelKmPerLiter ? `${formatNumber(Number(vehicle.fuelKmPerLiter))} km/l` : "Sin dato"}</strong>
          </article>
          <article>
            <span>Actualizado</span>
            <strong>{formatShortDate(vehicle.updatedAt)}</strong>
          </article>
        </div>

        <div className="vehicleDetailActions">
          <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
          <button type="button" className="secondaryButton" onClick={onLoadSummary} disabled={loading || !vehicle.traccarDeviceId}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Generar resumen GPS
          </button>
          <button type="button" className="secondaryButton" onClick={onToggleActive}>
            {vehicle.active ? "Desactivar" : "Activar"}
          </button>
          <button type="button" className="secondaryButton vehicleDeleteButton" onClick={onDelete}>
            <X size={18} />
            Eliminar vehiculo
          </button>
        </div>

        {error ? <p className="formError">{error}</p> : null}
        {summary?.message ? <p className="emptyPanel">{summary.message}</p> : null}

        {summary ? (
          <>
            <div className="vehicleTrackingSummary">
              <article>
                <span>Kilometros</span>
                <strong>{formatNumber(summary.distanceKm)} km</strong>
                <small>{summary.positions} puntos GPS</small>
              </article>
              <article>
                <span>Velocidad min.</span>
                <strong>{formatNumber(summary.minSpeedKmh, 1)} km/h</strong>
                <small>En movimiento</small>
              </article>
              <article>
                <span>Velocidad prom.</span>
                <strong>{formatNumber(summary.averageSpeedKmh, 1)} km/h</strong>
                <small>{formatDuration(summary.movingMinutes)} movimiento</small>
              </article>
              <article>
                <span>Velocidad max.</span>
                <strong>{formatNumber(summary.maxSpeedKmh, 1)} km/h</strong>
                <small>{summary.stops.length} paradas</small>
              </article>
              <article>
                <span>Combustible estimado</span>
                <strong>{formatNumber(summary.estimatedLiters)} l</strong>
                <small>{formatCurrency(summary.estimatedFuelCost)} aprox.</small>
              </article>
            </div>

            <div className="traccarLists">
              <section>
                <h3>Visitas detectadas</h3>
                <div className="vehicleVisitList">
                  {summary.visits.map((visit) => (
                    <article key={`${visit.stopIndex}-${visit.customerId}-${visit.siteId ?? "customer"}`}>
                      <div>
                        <strong>{visit.customerName}</strong>
                        <span>{visit.siteName || visit.address || "Cliente identificado"}</span>
                      </div>
                      <span className="visitMatchPill">{visit.match}</span>
                      <small>
                        {formatShortDateTime(visit.arrival)} - {formatDuration(visit.durationMinutes)}
                      </small>
                    </article>
                  ))}
                  {!summary.visits.length ? <p className="emptyPanel">No se detectaron visitas a clientes.</p> : null}
                </div>
              </section>

              <section>
                <h3>Paradas sin cliente</h3>
                <div className="vehicleStopList">
                  {summary.unmatchedStops.slice(0, 8).map((stop) => (
                    <article key={stop.index}>
                      <strong>{formatShortDateTime(stop.arrival)}</strong>
                      <span>{stop.address || `${formatNumber(stop.latitude)}, ${formatNumber(stop.longitude)}`}</span>
                      <small>{formatDuration(stop.durationMinutes)}</small>
                    </article>
                  ))}
                  {!summary.unmatchedStops.length ? <p className="emptyPanel">Todas las paradas coinciden con clientes o sitios.</p> : null}
                </div>
              </section>
            </div>
          </>
        ) : (
          <p className="emptyPanel">Genera el resumen para ver kilometros, paradas y visitas del dia seleccionado.</p>
        )}
      </section>
    </div>
  );
}

function InventoryView({
  devices,
  editingInventoryItemId,
  inventoryCategory,
  inventoryCatalogMatches,
  inventoryError,
  inventoryForm,
  inventoryItems,
  inventoryMode,
  inventoryMovementForm,
  inventorySearch,
  inventoryStats,
  inventoryStockFilter,
  inventorySupplier,
  loading,
  workOrders,
  onCancelEdit,
  onCategoryChange,
  onDeleteItem,
  onDeleteMovement,
  onEditItem,
  onFormChange,
  onModeChange,
  onMovementFormChange,
  onMovementSave,
  onQuickMovement,
  onRefresh,
  onSave,
  onSearchChange,
  onStockFilterChange,
  onSupplierChange,
}: {
  devices: InstalledDevice[];
  editingInventoryItemId: string | null;
  inventoryCategory: DeviceType | "ALL";
  inventoryCatalogMatches: InventoryItem[];
  inventoryError: string;
  inventoryForm: InventoryItemPayload;
  inventoryItems: InventoryItem[];
  inventoryMode: "stock" | "catalog" | "all";
  inventoryMovementForm: InventoryMovementPayload;
  inventorySearch: string;
  inventoryStats: Array<{ label: string; value: number | string }>;
  inventoryStockFilter: "ALL" | "LOW";
  inventorySupplier: string;
  loading: boolean;
  workOrders: WorkOrder[];
  onCancelEdit: () => void;
  onCategoryChange: (value: DeviceType | "ALL") => void;
  onDeleteItem: (item: InventoryItem) => void;
  onDeleteMovement: (movementId: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onFormChange: (form: InventoryItemPayload) => void;
  onModeChange: (value: "stock" | "catalog" | "all") => void;
  onMovementFormChange: (form: InventoryMovementPayload) => void;
  onMovementSave: (event: FormEvent<HTMLFormElement>) => void;
  onQuickMovement: (itemId: string, type: InventoryMovementType, quantity: number) => Promise<void>;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onStockFilterChange: (value: "ALL" | "LOW") => void;
  onSupplierChange: (value: string) => void;
}) {
  const [movementItemQuery, setMovementItemQuery] = useState("");
  const [movementPickerOpen, setMovementPickerOpen] = useState(false);
  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);
  const [stockForms, setStockForms] = useState<Record<string, { entry: number; exact: number }>>({});
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
  const [inventoryColumnWidths, setInventoryColumnWidths] = useState<Record<InventoryColumnKey, number>>(() => {
    if (typeof window === "undefined") {
      return inventoryColumnDefaults;
    }

    try {
      const saved = window.localStorage.getItem("sscc.inventoryColumns");
      if (!saved) {
        return inventoryColumnDefaults;
      }

      return { ...inventoryColumnDefaults, ...(JSON.parse(saved) as Partial<Record<InventoryColumnKey, number>>) };
    } catch {
      return inventoryColumnDefaults;
    }
  });
  const [inventorySort, setInventorySort] = useState<{ key: InventorySortKey; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });
  const inventoryGridTemplate = inventoryColumnOrder.map((key) => `${inventoryColumnWidths[key]}px`).join(" ");
  const inventoryGridMinWidth = inventoryColumnOrder.reduce((total, key) => total + inventoryColumnWidths[key], 0);
  const inventoryGridStyle: CSSProperties = {
    gridTemplateColumns: inventoryGridTemplate,
    minWidth: inventoryGridMinWidth,
  };
  const suppliers = Array.from(
    new Set(["Microfal", ...(inventoryItems.map((item) => item.supplier).filter(Boolean) as string[])]),
  ).sort();
  const selectedInventoryItem = inventoryItems.find((item) => item.id === selectedInventoryItemId) ?? null;
  const sortedInventoryItems = useMemo(() => {
    return [...inventoryItems].sort((left, right) => {
      const leftValue = inventorySortValue(left, inventorySort.key);
      const rightValue = inventorySortValue(right, inventorySort.key);
      const result =
        typeof leftValue === "number" && typeof rightValue === "number"
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), "es", { numeric: true, sensitivity: "base" });

      return inventorySort.direction === "asc" ? result : -result;
    });
  }, [inventoryItems, inventorySort]);
  const selectedMovementItem = inventoryItems.find((item) => item.id === inventoryMovementForm.itemId);
  const movementItemResults = useMemo(() => {
    const query = movementItemQuery.trim().toLowerCase();
    const matches = query
      ? inventoryItems.filter((item) =>
          [item.name, item.sku, item.supplier, item.supplierCategory]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
        )
      : inventoryItems;

    return matches.slice(0, 8);
  }, [inventoryItems, movementItemQuery]);

  useEffect(() => {
    if (selectedMovementItem && movementItemQuery !== selectedMovementItem.name) {
      setMovementItemQuery(selectedMovementItem.name);
    }
  }, [inventoryMovementForm.itemId, selectedMovementItem]);

  useEffect(() => {
    window.localStorage.setItem("sscc.inventoryColumns", JSON.stringify(inventoryColumnWidths));
  }, [inventoryColumnWidths]);

  function stockForm(item: InventoryItem) {
    return stockForms[item.id] ?? { entry: 1, exact: item.stock };
  }

  function updateStockForm(itemId: string, nextForm: { entry: number; exact: number }) {
    setStockForms((current) => ({ ...current, [itemId]: nextForm }));
  }

  function toggleInventorySort(key: InventorySortKey) {
    setInventorySort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function startInventoryColumnResize(key: InventoryColumnKey, event: ReactMouseEvent<HTMLSpanElement>) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = inventoryColumnWidths[key];

    function resize(moveEvent: MouseEvent) {
      const nextWidth = Math.max(inventoryColumnMinimums[key], startWidth + moveEvent.clientX - startX);
      setInventoryColumnWidths((current) => ({ ...current, [key]: nextWidth }));
    }

    function stopResize() {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    }

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
  }

  return (
    <section className="workOrdersModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de almacen">
        {inventoryStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="workOrdersLayout">
        <div className="inventoryForms">
          <form className="workOrderForm" onSubmit={onSave}>
            <div className="sectionHeader compactHeader">
              <div>
                <p>{editingInventoryItemId ? "Actualizar stock" : "Alta de stock"}</p>
                <h2>{editingInventoryItemId ? "Editar articulo" : "Nuevo articulo"}</h2>
              </div>
              {editingInventoryItemId ? (
                <button type="button" className="secondaryButton" onClick={onCancelEdit}>
                  <X size={17} />
                  Cancelar
                </button>
              ) : null}
            </div>
            <div className="formGrid">
              <label>
                SKU
                <input value={inventoryForm.sku} onChange={(event) => onFormChange({ ...inventoryForm, sku: event.target.value })} />
              </label>
              <label>
                Categoria
                <select
                  value={inventoryForm.category}
                  onChange={(event) => onFormChange({ ...inventoryForm, category: event.target.value as DeviceType | "" })}
                >
                  <option value="">Sin categoria</option>
                  {Object.entries(deviceTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wideField">
                Nombre
                <div className="autocompleteField">
                  <input
                    value={inventoryForm.name}
                    onChange={(event) => {
                      onFormChange({ ...inventoryForm, name: event.target.value });
                      setCatalogPickerOpen(true);
                    }}
                    onFocus={() => setCatalogPickerOpen(true)}
                    onBlur={() => window.setTimeout(() => setCatalogPickerOpen(false), 120)}
                    placeholder="Buscar en catalogo o escribir articulo nuevo"
                    autoComplete="off"
                  />
                  {catalogPickerOpen && inventoryCatalogMatches.length ? (
                    <div className="autocompleteResults">
                      {inventoryCatalogMatches.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            onEditItem(item);
                            setCatalogPickerOpen(false);
                          }}
                        >
                          <strong>{item.name}</strong>
                          <span>
                            {[item.sku ? `SKU ${item.sku}` : "", item.supplier, item.supplierCategory, item.managedStock ? `Stock ${item.stock}` : "Catalogo"]
                              .filter(Boolean)
                              .join(" - ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>
              <label>
                Cantidad en stock
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.stock}
                  onChange={(event) =>
                    onFormChange({
                      ...inventoryForm,
                      stock: Number(event.target.value),
                      minStock: 0,
                      managedStock: true,
                    })
                  }
                  placeholder="Stock real disponible"
                />
              </label>
              <label>
                Unidad
                <input value={inventoryForm.unit} onChange={(event) => onFormChange({ ...inventoryForm, unit: event.target.value })} />
              </label>
              <label>
                Ubicacion
                <input
                  value={inventoryForm.location}
                  onChange={(event) => onFormChange({ ...inventoryForm, location: event.target.value })}
                  placeholder="Estante, camioneta, deposito"
                />
              </label>
              <label className="wideField">
                Proveedor
                <input
                  value={inventoryForm.supplier}
                  onChange={(event) => onFormChange({ ...inventoryForm, supplier: event.target.value })}
                />
              </label>
              <label className="wideField">
                Notas
                <textarea value={inventoryForm.notes} onChange={(event) => onFormChange({ ...inventoryForm, notes: event.target.value })} />
              </label>
            </div>
            <button className="primaryButton" type="submit" disabled={loading}>
              <Save size={18} />
              {editingInventoryItemId ? "Guardar cambios" : "Guardar articulo"}
            </button>
          </form>

          <form className="workOrderForm" onSubmit={onMovementSave}>
            <div className="sectionHeader compactHeader">
              <div>
                <p>Movimiento</p>
                <h2>Consumir o ajustar</h2>
              </div>
            </div>
            <div className="formGrid">
              <label className="wideField">
                Articulo
                <div className="autocompleteField">
                  <input
                    value={movementItemQuery}
                    onChange={(event) => {
                      setMovementItemQuery(event.target.value);
                      setMovementPickerOpen(true);
                      if (inventoryMovementForm.itemId) {
                        onMovementFormChange({ ...inventoryMovementForm, itemId: "" });
                      }
                    }}
                    onFocus={() => setMovementPickerOpen(true)}
                    onBlur={() => window.setTimeout(() => setMovementPickerOpen(false), 120)}
                    placeholder="Buscar por nombre, SKU o importador"
                    autoComplete="off"
                  />
                  {movementPickerOpen ? (
                    <div className="autocompleteResults">
                      {movementItemResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            onMovementFormChange({ ...inventoryMovementForm, itemId: item.id });
                            setMovementItemQuery(item.name);
                            setMovementPickerOpen(false);
                          }}
                        >
                          <strong>{item.name}</strong>
                          <span>
                            {[item.sku ? `SKU ${item.sku}` : "", item.supplier, item.managedStock ? `${item.stock} ${item.unit}` : "Catalogo"]
                              .filter(Boolean)
                              .join(" - ")}
                          </span>
                        </button>
                      ))}
                      {!movementItemResults.length ? <p>No hay articulos relacionados.</p> : null}
                    </div>
                  ) : null}
                </div>
              </label>
              <label>
                Tipo
                <select
                  value={inventoryMovementForm.type}
                  onChange={(event) =>
                    onMovementFormChange({ ...inventoryMovementForm, type: event.target.value as InventoryMovementType })
                  }
                >
                  <option value="IN">Entrada</option>
                  <option value="OUT">Salida</option>
                  <option value="ADJUST">Ajuste exacto</option>
                </select>
              </label>
              <label>
                Cantidad
                <input
                  type="number"
                  min="0"
                  value={inventoryMovementForm.quantity}
                  onChange={(event) => onMovementFormChange({ ...inventoryMovementForm, quantity: Number(event.target.value) })}
                />
              </label>
              <label className="wideField">
                Trabajo relacionado
                <select
                  value={inventoryMovementForm.workOrderId}
                  onChange={(event) => onMovementFormChange({ ...inventoryMovementForm, workOrderId: event.target.value })}
                >
                  <option value="">Sin trabajo</option>
                  {workOrders.map((workOrder) => (
                    <option key={workOrder.id} value={workOrder.id}>
                      {workOrder.title} - {workOrder.customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wideField">
                Equipo instalado
                <select
                  value={inventoryMovementForm.installedDeviceId}
                  onChange={(event) => onMovementFormChange({ ...inventoryMovementForm, installedDeviceId: event.target.value })}
                >
                  <option value="">Sin equipo</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {[device.brand, device.model, device.serial].filter(Boolean).join(" ") || device.type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wideField">
                Motivo
                <textarea
                  value={inventoryMovementForm.reason}
                  onChange={(event) => onMovementFormChange({ ...inventoryMovementForm, reason: event.target.value })}
                  placeholder="Uso en instalacion, compra, recuento, devolucion"
                />
              </label>
            </div>
            <button className="primaryButton" type="submit" disabled={loading || !inventoryItems.length}>
              <RefreshCw size={18} />
              Registrar movimiento
            </button>
          </form>
        </div>

        <section className="workOrderDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={inventorySearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar articulo, SKU, ubicacion o proveedor"
              />
            </label>
            <select value={inventoryCategory} onChange={(event) => onCategoryChange(event.target.value as DeviceType | "ALL")}>
              <option value="ALL">Todas</option>
              {Object.entries(deviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={inventorySupplier} onChange={(event) => onSupplierChange(event.target.value)} aria-label="Filtrar por importador">
              <option value="ALL">Importadores</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
            <select value={inventoryMode} onChange={(event) => onModeChange(event.target.value as "stock" | "catalog" | "all")} aria-label="Vista de almacen">
              <option value="stock">Stock real</option>
              <option value="catalog">Catalogo</option>
              <option value="all">Todo</option>
            </select>
            <select value={inventoryStockFilter} onChange={(event) => onStockFilterChange(event.target.value as "ALL" | "LOW")}>
              <option value="ALL">Todo stock</option>
              <option value="LOW">Sin stock</option>
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>
          {inventoryError ? <p className="formError">{inventoryError}</p> : null}
          <div className="inventoryTableScroller">
            <div className="inventorySortBar" style={inventoryGridStyle} aria-label="Ordenar almacen">
              {[
                ["reference", "Ref."],
                ["date", "Fecha"],
                ["brand", "Importador"],
                ["model", "Modelo"],
                ["installed", "Instalado"],
                ["status", "Estado"],
              ].map(([key, label]) => (
                <button key={key} type="button" onClick={() => toggleInventorySort(key as InventorySortKey)}>
                  {label} {inventorySort.key === key ? (inventorySort.direction === "asc" ? "↑" : "↓") : "↕"}
                  <span
                    className="columnResizeHandle"
                    onMouseDown={(event) => startInventoryColumnResize(key as InventorySortKey, event)}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <span className="inventoryActionHeader" aria-hidden="true">
                <span
                  className="columnResizeHandle"
                  onMouseDown={(event) => startInventoryColumnResize("actions", event)}
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="workOrderGrid inventoryDirectoryList">
            {sortedInventoryItems.map((item) => {
              const form = stockForm(item);
              const installedQuantity = item.installedQuantity ?? 0;
              const totalManagedQuantity = item.managedStock ? item.stock + installedQuantity : installedQuantity;
              const statusLabel = !item.managedStock ? "Catalogo" : item.stock === 0 ? "Sin stock" : "Disponible";
              const statusClass = !item.managedStock ? "scheduled" : item.stock === 0 ? "waiting_customer" : "completed";

              return (
              <article
                key={item.id}
                className="workOrderCard"
                style={inventoryGridStyle}
                onClick={() => setSelectedInventoryItemId(item.id)}
              >
                <span className="inventoryRef">{item.reference}</span>
                <span className="inventoryDate">{formatInventoryDate(item.updatedAt)}</span>
                <span className="inventoryBrand">{item.supplier || "Sin importador"}</span>
                <strong className="inventoryModel" title={item.name}>{item.name}</strong>
                <span className="inventoryInstalled">{installedQuantity} {item.unit}</span>
                <span className={`statusPill ${statusClass}`}>{statusLabel}</span>
                <div className="workOrderActions">
                  <button type="button" className="secondaryButton" onClick={(event) => {
                    event.stopPropagation();
                    onEditItem(item);
                  }}>
                    <Edit3 size={16} />
                    Editar
                  </button>
                  <button type="button" className="secondaryButton dangerButton" onClick={(event) => {
                    event.stopPropagation();
                    onDeleteItem(item);
                  }} disabled={loading}>
                    <X size={16} />
                    Eliminar
                  </button>
                </div>
                <dl>
                  <div>
                    <dt>Disponible</dt>
                    <dd>
                      {item.managedStock ? `${item.stock} ${item.unit}` : "Sin ingresar"}
                    </dd>
                  </div>
                  <div>
                    <dt>Instalado</dt>
                    <dd>{installedQuantity} {item.unit}</dd>
                  </div>
                  <div>
                    <dt>Total real</dt>
                    <dd>{totalManagedQuantity} {item.unit}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>{item.category ? deviceTypeLabels[item.category] : "Sin categoria"}</dd>
                  </div>
                  <div>
                    <dt>Ubicacion</dt>
                    <dd>{item.location || "Sin ubicacion"}</dd>
                  </div>
                  <div>
                    <dt>Proveedor</dt>
                    <dd>{item.supplier || "Sin proveedor"}</dd>
                  </div>
                  <div>
                    <dt>Precio IVA inc.</dt>
                    <dd>{formatPrice(item.priceWithTax, item.currency)}</dd>
                  </div>
                </dl>
                <p>{[item.sku ? `SKU ${item.sku}` : "", item.supplierCategory, item.notes].filter(Boolean).join(" · ") || "Sin datos adicionales"}</p>
                <div className="stockQuickActions">
                  <div>
                    <label>
                      Entrada
                      <input
                        type="number"
                        min="1"
                        value={form.entry}
                        onChange={(event) => updateStockForm(item.id, { ...form, entry: Math.max(1, Number(event.target.value) || 1) })}
                      />
                    </label>
                    <button
                      type="button"
                      className="secondaryButton"
                      disabled={loading || form.entry <= 0}
                      onClick={() => onQuickMovement(item.id, "IN", form.entry)}
                    >
                      Sumar
                    </button>
                  </div>
                  <div>
                    <label>
                      Stock exacto
                      <input
                        type="number"
                        min="0"
                        value={form.exact}
                        onChange={(event) => updateStockForm(item.id, { ...form, exact: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </label>
                    <button
                      type="button"
                      className="secondaryButton"
                      disabled={loading || form.exact < 0}
                      onClick={() => onQuickMovement(item.id, "ADJUST", form.exact)}
                    >
                      Ajustar
                    </button>
                  </div>
                </div>
                <div className="movementList">
                  {item.movements.map((movement) => (
                    <span key={movement.id}>
                      {movement.type} {movement.quantity} - stock {movement.stockAfter}
                      <button type="button" onClick={() => onDeleteMovement(movement.id)} disabled={loading} aria-label="Eliminar movimiento">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </article>
              );
            })}
            {!inventoryItems.length ? <p className="emptyPanel">No hay articulos para los filtros actuales.</p> : null}
            </div>
          </div>
          {selectedInventoryItem && typeof document !== "undefined" ? (() => {
            const form = stockForm(selectedInventoryItem);
            const installedQuantity = selectedInventoryItem.installedQuantity ?? 0;
            const totalManagedQuantity = selectedInventoryItem.managedStock ? selectedInventoryItem.stock + installedQuantity : installedQuantity;

            return createPortal(
              <div className="deviceDetailOverlay customerProfileOverlay" onClick={() => setSelectedInventoryItemId(null)}>
                <section className="customerProfileModal inventoryDetailModal" aria-label="Detalle del articulo" onClick={(event) => event.stopPropagation()}>
                  <header className="deviceDetailHeader">
                    <div>
                      <span>Articulo de almacen</span>
                      <h2>{selectedInventoryItem.name}</h2>
                      <p>
                        {[
                          selectedInventoryItem.reference,
                          selectedInventoryItem.sku ? `SKU ${selectedInventoryItem.sku}` : "",
                          selectedInventoryItem.supplier,
                          selectedInventoryItem.supplierCategory,
                        ]
                          .filter(Boolean)
                          .join(" - ") || "Sin datos adicionales"}
                      </p>
                    </div>
                    <div className="documentToolbarActions">
                      <button
                        type="button"
                        className="secondaryButton"
                        onClick={() => {
                          setSelectedInventoryItemId(null);
                          onEditItem(selectedInventoryItem);
                        }}
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                      <button type="button" className="secondaryButton dangerButton" onClick={() => onDeleteItem(selectedInventoryItem)} disabled={loading}>
                        <X size={16} />
                        Eliminar
                      </button>
                      <button type="button" className="iconButton" onClick={() => setSelectedInventoryItemId(null)} aria-label="Cerrar articulo">
                        <X size={18} />
                      </button>
                    </div>
                  </header>

                  <dl className="customerProfileGrid">
                    <div>
                      <dt>Referencia</dt>
                      <dd>{selectedInventoryItem.reference}</dd>
                    </div>
                    <div>
                      <dt>Disponible</dt>
                      <dd>{selectedInventoryItem.managedStock ? `${selectedInventoryItem.stock} ${selectedInventoryItem.unit}` : "Sin ingresar"}</dd>
                    </div>
                    <div>
                      <dt>Instalado</dt>
                      <dd>{installedQuantity} {selectedInventoryItem.unit}</dd>
                    </div>
                    <div>
                      <dt>Total real</dt>
                      <dd>{totalManagedQuantity} {selectedInventoryItem.unit}</dd>
                    </div>
                    <div>
                      <dt>Categoria</dt>
                      <dd>{selectedInventoryItem.category ? deviceTypeLabels[selectedInventoryItem.category] : "Sin categoria"}</dd>
                    </div>
                    <div>
                      <dt>Ubicacion</dt>
                      <dd>{selectedInventoryItem.location || "Sin ubicacion"}</dd>
                    </div>
                    <div>
                      <dt>Proveedor</dt>
                      <dd>{selectedInventoryItem.supplier || "Sin proveedor"}</dd>
                    </div>
                    <div>
                      <dt>Precio IVA inc.</dt>
                      <dd>{formatPrice(selectedInventoryItem.priceWithTax, selectedInventoryItem.currency)}</dd>
                    </div>
                  </dl>

                  <p className="workOrderDetailNotes">{selectedInventoryItem.notes || "Sin notas del articulo."}</p>

                  <section className="customerProfileSection">
                    <div className="customerProfileSectionHeader">
                      <h3>Stock</h3>
                    </div>
                    <div className="stockQuickActions">
                      <div>
                        <label>
                          Entrada
                          <input
                            type="number"
                            min="1"
                            value={form.entry}
                            onChange={(event) =>
                              updateStockForm(selectedInventoryItem.id, { ...form, entry: Math.max(1, Number(event.target.value) || 1) })
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="secondaryButton"
                          disabled={loading || form.entry <= 0}
                          onClick={() => onQuickMovement(selectedInventoryItem.id, "IN", form.entry)}
                        >
                          Sumar
                        </button>
                      </div>
                      <div>
                        <label>
                          Stock exacto
                          <input
                            type="number"
                            min="0"
                            value={form.exact}
                            onChange={(event) =>
                              updateStockForm(selectedInventoryItem.id, { ...form, exact: Math.max(0, Number(event.target.value) || 0) })
                            }
                          />
                        </label>
                        <button
                          type="button"
                          className="secondaryButton"
                          disabled={loading || form.exact < 0}
                          onClick={() => onQuickMovement(selectedInventoryItem.id, "ADJUST", form.exact)}
                        >
                          Ajustar
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="customerProfileSection">
                    <div className="customerProfileSectionHeader">
                      <h3>Movimientos recientes</h3>
                    </div>
                    <div className="movementList inventoryDetailMovements">
                      {selectedInventoryItem.movements.map((movement) => (
                        <span key={movement.id}>
                          {movement.type} {movement.quantity} - stock {movement.stockAfter}
                          <button type="button" onClick={() => onDeleteMovement(movement.id)} disabled={loading} aria-label="Eliminar movimiento">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {!selectedInventoryItem.movements.length ? <p>Sin movimientos recientes.</p> : null}
                    </div>
                  </section>
                </section>
              </div>,
              document.body,
            );
          })() : null}
        </section>
      </div>
    </section>
  );
}

function GmailView({
  gmailError,
  gmailStats,
  loading,
  status,
  sync,
  onRefresh,
}: {
  gmailError: string;
  gmailStats: Array<{ label: string; value: number | string }>;
  loading: boolean;
  status: GmailStatus;
  sync: GmailSync;
  onRefresh: () => void;
}) {
  return (
    <section className="gmailModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de Gmail">
        {gmailStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <section className="gmailStatusPanel">
        <div>
          <p>Integracion</p>
          <h2>{status.connected ? "Gmail conectado" : "Gmail pendiente de conectar"}</h2>
          <span>
            {status.connected
              ? `Cuenta ${sync.emailAddress || "Gmail"} lista para sincronizar.`
              : "Faltan credenciales OAuth en el entorno."}
          </span>
          <small className="syncStamp">
            {sync.lastSyncAt ? `Ultima sincronizacion: ${formatDateTime(sync.lastSyncAt)}` : "Sin sincronizacion todavia"}
          </small>
        </div>
        <button type="button" onClick={onRefresh}>
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          Sincronizar
        </button>
      </section>

      {gmailError ? <p className="formError">{gmailError}</p> : null}

      <div className="gmailLayout">
        <section className="gmailPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Checklist</p>
              <h2>Configuracion OAuth</h2>
            </div>
          </div>
          <div className="integrationChecklist">
            {status.checks.map((check) => (
              <article key={check.key}>
                <span className={`statusPill ${check.configured ? "completed" : "scheduled"}`}>
                  {check.configured ? "Listo" : "Pendiente"}
                </span>
                <div>
                  <strong>{check.label}</strong>
                  <small>{check.key}</small>
                </div>
              </article>
            ))}
            {!status.checks.length ? <p className="emptyPanel">No hay variables de Gmail definidas todavia.</p> : null}
          </div>
        </section>

        <section className="gmailPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Operacion</p>
              <h2>Correos recientes</h2>
            </div>
          </div>
          <div className="gmailMessageList">
            {sync.messages.map((message) => (
              <article key={message.id} className={message.unread ? "unreadMail" : ""}>
                <div>
                  <strong>{message.subject}</strong>
                  <span>{message.from || "Remitente desconocido"} · {formatMailDate(message.date)}</span>
                </div>
                <p>{message.snippet || "Sin vista previa disponible"}</p>
                {message.important ? <em>Importante</em> : null}
              </article>
            ))}
            {!sync.messages.length ? <p className="emptyPanel">Todavia no hay correos sincronizados.</p> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

function WhatsAppView({
  customers,
  loading,
  status,
  sync,
  dailySummary,
  dailySummaryForm,
  whatsAppError,
  whatsAppStats,
  savingSummary,
  onDailySummaryChange,
  onSaveDailySummary,
  onSendDailySummary,
  onRefresh,
  onReply,
}: {
  customers: Customer[];
  loading: boolean;
  status: WhatsAppStatus;
  sync: WhatsAppSync;
  dailySummary: WhatsAppDailyMeetingSummary;
  dailySummaryForm: WhatsAppDailyMeetingSummaryPayload;
  whatsAppError: string;
  whatsAppStats: Array<{ label: string; value: number | string }>;
  savingSummary: boolean;
  onDailySummaryChange: (form: WhatsAppDailyMeetingSummaryPayload) => void;
  onSaveDailySummary: () => void;
  onSendDailySummary: () => void;
  onRefresh: () => void;
  onReply: (chat: WhatsAppChat) => void;
}) {
  const [showOpenWaChecklist, setShowOpenWaChecklist] = useState(false);
  const contactOptions = [
    ...sync.chats.map((chat) => ({ id: chat.id, label: chat.name || chat.id })),
    ...sync.groups.map((group) => ({ id: group.id, label: group.name || group.id })),
  ];
  const chatSections = groupWhatsAppChats(sync.chats, sync.groups, customers);

  return (
    <section className="whatsAppModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de WhatsApp">
        {whatsAppStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <section className="integrationStatusPanel">
        <div>
          <p>Integracion</p>
          <h2>{status.connected ? "WhatsApp conectado" : "OpenWA pendiente de conectar"}</h2>
          <span>
            {status.connected
              ? `Sesion ${sync.session?.name ?? "OpenWA"} lista para operar mensajes.`
              : status.connectionError || "Falta configurar OpenWA, sesion o token de API."}
          </span>
          <small className="syncStamp">
            {sync.lastSyncAt ? `Ultima sincronizacion: ${formatDateTime(sync.lastSyncAt)}` : "Sin sincronizacion todavia"}
          </small>
        </div>
        <button type="button" onClick={onRefresh}>
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          Sincronizar
        </button>
      </section>

      {whatsAppError ? <p className="formError">{whatsAppError}</p> : null}

      <section className="integrationPanel compactSettingsPanel">
        <div>
          <p>Configuracion</p>
          <strong>OpenWA</strong>
          <span>
            {status.checks.filter((check) => check.configured).length}/{status.checks.length || 4} datos listos
          </span>
        </div>
        <button type="button" className="iconButton" onClick={() => setShowOpenWaChecklist((current) => !current)} aria-label="Ver configuracion OpenWA">
          <Menu size={20} />
        </button>
      </section>

      <div className="integrationLayout">
        {showOpenWaChecklist ? (
          <section className="integrationPanel">
            <div className="sectionHeader compactHeader">
              <div>
                <p>Checklist</p>
                <h2>Configuracion OpenWA</h2>
              </div>
            </div>
            <div className="integrationChecklist">
              {status.checks.map((check) => (
                <article key={check.key}>
                  <span className={`statusPill ${check.configured ? "completed" : "scheduled"}`}>
                    {check.configured ? "Listo" : "Pendiente"}
                  </span>
                  <div>
                    <strong>{check.label}</strong>
                    <small>{check.key}</small>
                  </div>
                </article>
              ))}
              {!status.checks.length ? <p className="emptyPanel">No hay variables de OpenWA definidas todavia.</p> : null}
            </div>
          </section>
        ) : null}

        <section className="integrationPanel dailySummaryPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Resumen automatico</p>
              <h2>Reuniones de manana</h2>
            </div>
            <span className={`statusPill ${dailySummaryForm.enabled ? "completed" : "scheduled"}`}>
              {dailySummaryForm.enabled ? "Activo" : "Pausado"}
            </span>
          </div>

          <div className="formGrid">
            <label>
              Envio automatico
              <select
                value={dailySummaryForm.enabled ? "true" : "false"}
                onChange={(event) => onDailySummaryChange({ ...dailySummaryForm, enabled: event.target.value === "true" })}
              >
                <option value="true">Activado</option>
                <option value="false">Desactivado</option>
              </select>
            </label>
            <label>
              Hora
              <input
                type="time"
                value={dailySummaryForm.sendTime}
                onChange={(event) => onDailySummaryChange({ ...dailySummaryForm, sendTime: event.target.value })}
              />
            </label>
            <label>
              Contacto
              <select
                value={dailySummaryForm.recipientPhone}
                onChange={(event) => {
                  const selected = contactOptions.find((option) => option.id === event.target.value);
                  onDailySummaryChange({
                    ...dailySummaryForm,
                    recipientPhone: event.target.value,
                    recipientName: selected?.label ?? dailySummaryForm.recipientName,
                  });
                }}
              >
                <option value={dailySummaryForm.recipientPhone || ""}>
                  {dailySummaryForm.recipientName || dailySummaryForm.recipientPhone || "Manual"}
                </option>
                {contactOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Numero / chat ID
              <input
                value={dailySummaryForm.recipientPhone}
                onChange={(event) => onDailySummaryChange({ ...dailySummaryForm, recipientPhone: event.target.value })}
                placeholder="097684200 o chat@c.us"
              />
            </label>
            <label className="wideField">
              Nombre del destinatario
              <input
                value={dailySummaryForm.recipientName}
                onChange={(event) => onDailySummaryChange({ ...dailySummaryForm, recipientName: event.target.value })}
                placeholder="Tecnico, administracion, compañero"
              />
            </label>
            <label className="wideField">
              Mensaje editable
              <textarea
                value={dailySummaryForm.messageTemplate}
                onChange={(event) => onDailySummaryChange({ ...dailySummaryForm, messageTemplate: event.target.value })}
                rows={7}
              />
            </label>
          </div>

          <div className="dailySummaryPreview">
            <div>
              <span>Mensaje que se enviara manana</span>
              <strong>
                {dailySummary.preview.dateLabel || "Proxima fecha"} - {dailySummary.preview.meetingsCount} reuniones
              </strong>
            </div>
            <pre>{dailySummary.preview.message || "Guarda para generar la vista previa."}</pre>
          </div>

          <div className="meetingActions">
            <button type="button" className="secondaryButton" onClick={onSaveDailySummary} disabled={savingSummary}>
              <Save size={16} />
              Guardar
            </button>
            <button type="button" className="secondaryButton" onClick={onSendDailySummary} disabled={savingSummary || !dailySummaryForm.recipientPhone}>
              <MessageSquare size={16} />
              Enviar ahora
            </button>
          </div>
          {dailySummary.settings.lastSentAt ? (
            <p className="syncStamp">Ultimo envio: {formatDateTime(dailySummary.settings.lastSentAt)}</p>
          ) : null}
        </section>

        <section className="integrationPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Operacion</p>
              <h2>Chats recientes</h2>
            </div>
          </div>
          <div className="whatsAppSectionList">
            {chatSections.map((section) => (
              <section key={section.title} className="whatsAppChatSection">
                <div className="whatsAppChatSectionHeader">
                  <div>
                    <span>{section.caption}</span>
                    <strong>{section.title}</strong>
                  </div>
                  <em>{section.chats.length}</em>
                </div>
                <div className="whatsAppChatList">
                  {section.chats.map((chat) => (
                    <article key={chat.id} className={chat.unreadCount ? "unreadChat" : ""}>
                      <div>
                        <strong>{chat.name || chat.id}</strong>
                        <span>{chat.isGroup ? "Grupo" : "Chat"} - {formatWhatsAppTime(chat.timestamp)}</span>
                      </div>
                      <p>{chat.lastMessage || "Sin ultimo mensaje disponible"}</p>
                      <button type="button" className="secondaryButton" onClick={() => onReply(chat)}>
                        <MessageSquare size={16} />
                        Responder
                      </button>
                      {chat.unreadCount ? <em>{chat.unreadCount}</em> : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
            {!sync.chats.length && !sync.groups.length ? <p className="emptyPanel">Todavia no hay chats sincronizados.</p> : null}
          </div>
        </section>

        <section className="integrationPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Grupos</p>
              <h2>Grupos sincronizados</h2>
            </div>
          </div>
          <div className="whatsAppGroupGrid">
            {sync.groups.slice(0, 12).map((group) => (
              <article key={group.id}>
                <MessageSquare size={19} />
                <strong>{group.name || group.id}</strong>
              </article>
            ))}
            {!sync.groups.length ? <p className="emptyPanel">Todavia no hay grupos sincronizados.</p> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

function DevicesView({
  customers,
  deviceError,
  deviceForm,
  focusedDeviceGroupKey,
  deviceSearch,
  deviceStats,
  deviceType,
  devices,
  loading,
  selectedCustomerId,
  sites,
  onDeviceFormChange,
  onDuplicateDevice,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onTypeChange,
}: {
  customers: Customer[];
  deviceError: string;
  deviceForm: DevicePayload;
  focusedDeviceGroupKey: string | null;
  deviceSearch: string;
  deviceStats: Array<{ label: string; value: number }>;
  deviceType: DeviceType | "ALL";
  devices: InstalledDevice[];
  loading: boolean;
  selectedCustomerId: string | null;
  sites: CustomerSite[];
  onDeviceFormChange: (form: DevicePayload) => void;
  onDuplicateDevice: (device: InstalledDevice) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onTypeChange: (value: DeviceType | "ALL") => void;
}) {
  const groupedDevices = groupInstalledDevices(devices);
  const [selectedDeviceGroupKey, setSelectedDeviceGroupKey] = useState<string | null>(null);
  const [deviceDetailQuery, setDeviceDetailQuery] = useState("");
  const selectedDeviceGroup = groupedDevices.find((group) => group.key === selectedDeviceGroupKey) ?? null;
  const selectedDeviceClients = selectedDeviceGroup
    ? filterInstalledDeviceClientGroups(selectedDeviceGroup.clientGroups, deviceDetailQuery)
    : [];

  useEffect(() => {
    if (focusedDeviceGroupKey) {
      setSelectedDeviceGroupKey(focusedDeviceGroupKey);
      setDeviceDetailQuery("");
    }
  }, [focusedDeviceGroupKey]);

  return (
    <section className="devicesModule">
      <div className="summaryGrid customerStats" aria-label="Resumen de equipos">
        {deviceStats.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="devicesLayout">
        <form className="deviceForm" onSubmit={onSave}>
          <div className="sectionHeader compactHeader">
            <div>
              <p>Inventario tecnico</p>
              <h2>Equipo instalado</h2>
            </div>
          </div>

          <div className="formGrid">
            <label>
              Cliente
              <select
                value={selectedCustomerId ?? ""}
                onChange={(event) => {
                  onSelectCustomer(event.target.value);
                  onDeviceFormChange({ ...deviceForm, siteId: "" });
                }}
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sitio
              <select
                value={deviceForm.siteId}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, siteId: event.target.value })}
                disabled={!selectedCustomerId}
              >
                <option value="">Seleccionar sitio</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select
                value={deviceForm.type}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, type: event.target.value as DeviceType })}
              >
                {Object.entries(deviceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha instalacion
              <input
                type="date"
                value={deviceForm.installedAt}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, installedAt: event.target.value })}
              />
            </label>
            <label>
              Marca
              <input
                value={deviceForm.brand}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, brand: event.target.value })}
                placeholder="Hikvision, Dahua, DSC"
              />
            </label>
            <label>
              Modelo
              <input
                value={deviceForm.model}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, model: event.target.value })}
                placeholder="Modelo del equipo"
              />
            </label>
            <label>
              Serie
              <input
                value={deviceForm.serial}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, serial: event.target.value })}
                placeholder="Numero de serie"
              />
            </label>
            <label>
              IP / Identificador
              <input
                value={deviceForm.ipAddress}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, ipAddress: event.target.value })}
                placeholder="192.168.1.50 o ID GPS"
              />
            </label>
            <label className="wideField">
              Notas
              <textarea
                value={deviceForm.notes}
                onChange={(event) => onDeviceFormChange({ ...deviceForm, notes: event.target.value })}
                placeholder="Ubicacion fisica, credenciales, canal, zona, observaciones"
              />
            </label>
          </div>

          {deviceError ? <p className="formError">{deviceError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            <Plus size={18} />
            Registrar equipo
          </button>
        </form>

        <section className="deviceDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={deviceSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por marca, modelo, serie, IP, cliente o sitio"
              />
            </label>
            <select
              value={deviceType}
              onChange={(event) => onTypeChange(event.target.value as DeviceType | "ALL")}
              aria-label="Filtrar por tipo"
            >
              <option value="ALL">Todos</option>
              {Object.entries(deviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="deviceGrid">
            {groupedDevices.map((deviceGroup) => (
              <article key={deviceGroup.key} className="deviceCard">
                <div className="deviceCardHeader">
                  <div className="deviceCardActions">
                    <span className="statusPill prospect">{deviceTypeLabels[deviceGroup.type]}</span>
                    <button type="button" className="duplicateButton" onClick={() => onDuplicateDevice(deviceGroup.sample)}>
                      <Copy size={15} />
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className="duplicateButton"
                      onClick={() => {
                        setSelectedDeviceGroupKey(deviceGroup.key);
                        setDeviceDetailQuery("");
                      }}
                    >
                      Consultar
                    </button>
                  </div>
                  <strong>{deviceGroup.model} x{deviceGroup.quantity}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Marca</dt>
                    <dd>{deviceGroup.brand || "Sin marca"}</dd>
                  </div>
                  <div>
                    <dt>Cantidad</dt>
                    <dd>{deviceGroup.quantity} instalados</dd>
                  </div>
                  <div>
                    <dt>Modelo</dt>
                    <dd>{deviceGroup.model}</dd>
                  </div>
                  <div>
                    <dt>Series</dt>
                    <dd>{deviceGroup.serialCount ? `${deviceGroup.serialCount} registradas` : "Sin series"}</dd>
                  </div>
                </dl>
              </article>
            ))}
            {!groupedDevices.length ? <p className="emptyPanel">No hay equipos para los filtros actuales.</p> : null}
          </div>
        </section>
      </div>
      {selectedDeviceGroup ? (
        <div className="deviceDetailOverlay">
          <section className="deviceDetailModal" aria-label="Detalle de equipos instalados">
            <header className="deviceDetailHeader">
              <div>
                <span>{deviceTypeLabels[selectedDeviceGroup.type]}</span>
                <h2>{selectedDeviceGroup.model}</h2>
                <p>
                  {[selectedDeviceGroup.brand || "Sin marca", `${selectedDeviceGroup.quantity} equipos instalados`]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
              <button type="button" className="iconButton" onClick={() => setSelectedDeviceGroupKey(null)} aria-label="Cerrar detalle">
                <X size={18} />
              </button>
            </header>
            <label className="searchBox deviceDetailSearch">
              <Search size={18} />
              <input
                value={deviceDetailQuery}
                onChange={(event) => setDeviceDetailQuery(event.target.value)}
                placeholder="Buscar cliente, sitio u orden dentro de este modelo"
              />
            </label>
            <div className="deviceModelDetail">
              {selectedDeviceClients.map((client) => (
                <section key={client.customerId}>
                  <header>
                    <strong>{client.customerName}</strong>
                    <span>{client.quantity} equipos</span>
                  </header>
                  <div>
                    {client.orders.map((order) => (
                      <article key={order.key}>
                        <span>{order.title}</span>
                        <strong>{order.quantity} u</strong>
                        <small>
                          {[order.siteNames.join(", "), order.date ? formatDateTime(order.date) : ""].filter(Boolean).join(" - ")}
                        </small>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
              {!selectedDeviceClients.length ? <p className="emptyPanel">No hay coincidencias en este modelo.</p> : null}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function cleanCustomerPayload(form: CustomerPayload): CustomerPayload {
  const coords = parseCoordinatesFromText(form.address);
  const directCoords = resolveOperationalCoordinates(form.latitude, form.longitude);
  const shouldClearInvalidCoords = hasCoordinates(form.latitude, form.longitude) && !directCoords;
  return {
    name: form.name.trim(),
    legalName: form.legalName?.trim() || undefined,
    taxId: form.taxId?.trim() || undefined,
    email: form.email?.trim() || undefined,
    phone: form.phone?.trim() || undefined,
    address: form.address?.trim() || undefined,
    latitude: directCoords?.latitude ?? coords?.latitude ?? (shouldClearInvalidCoords ? null : undefined),
    longitude: directCoords?.longitude ?? coords?.longitude ?? (shouldClearInvalidCoords ? null : undefined),
    logoUrl: form.logoUrl?.trim() || undefined,
    type: form.type ?? "NORMAL",
    status: form.status,
    notes: form.notes?.trim() || undefined,
  };
}

function cleanSitePayload(form: SitePayload): SitePayload {
  const coords = parseCoordinatesFromText(form.address);
  const directCoords = resolveOperationalCoordinates(form.latitude, form.longitude);
  const shouldClearInvalidCoords = hasCoordinates(form.latitude, form.longitude) && !directCoords;
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    latitude: directCoords?.latitude ?? coords?.latitude ?? (shouldClearInvalidCoords ? null : undefined),
    longitude: directCoords?.longitude ?? coords?.longitude ?? (shouldClearInvalidCoords ? null : undefined),
    notes: form.notes?.trim() || undefined,
  };
}

function cleanDevicePayload(form: DevicePayload): DevicePayload {
  return {
    siteId: form.siteId,
    type: form.type,
    brand: form.brand?.trim() || undefined,
    model: form.model?.trim() || undefined,
    serial: form.serial?.trim() || undefined,
    ipAddress: form.ipAddress?.trim() || undefined,
    installedAt: form.installedAt || undefined,
    notes: form.notes?.trim() || undefined,
  };
}

function cleanWorkOrderPayload(form: WorkOrderPayload): WorkOrderPayload {
  return {
    customerId: form.customerId,
    siteId: form.siteId || undefined,
    title: form.title.trim(),
    type: form.type,
    status: form.status,
    scheduledAt: form.scheduledAt || undefined,
    completedAt: form.completedAt || undefined,
    notes: form.notes?.trim() || undefined,
    reportBeforeNotes: form.reportBeforeNotes?.trim() || undefined,
    reportAfterNotes: form.reportAfterNotes?.trim() || undefined,
    reportTasks: form.reportTasks?.trim() || undefined,
    reportTests: form.reportTests?.trim() || undefined,
    reportRecommendations: form.reportRecommendations?.trim() || undefined,
    reportPhotos: form.reportPhotos ?? [],
  };
}

function cleanQuotePayload(form: QuotePayload): QuotePayload {
  const cleanDiscountPercent = Math.min(100, Math.max(0, Number(form.discountPercent) || 0));
  const cleanItems = form.items?.map((item) => ({
    priceBookItemId: item.priceBookItemId || undefined,
    type: item.type,
    category: item.category,
    description: item.description,
    quantity: Number(item.quantity) || 0,
    unit: item.unit,
    unitPrice: Number(item.unitPrice) || 0,
    taxRate: Number(item.taxRate) || 0,
    unitCost: Number(item.unitCost) || 0,
  }));

  return {
    customerId: form.customerId,
    meetingId: form.meetingId || undefined,
    number: form.number?.trim() || undefined,
    title: form.title.trim(),
    service: form.service || "OTHER",
    status: form.status || "DRAFT",
    pricingMode: form.pricingMode || "DIRECT",
    currency: form.currency?.trim() || "UYU",
    issueDate: form.issueDate || undefined,
    validUntil: form.validUntil || undefined,
    taxIncluded: form.taxIncluded ?? true,
    discountPercent: cleanDiscountPercent,
    discountAmount: Math.max(0, Number(form.discountAmount) || 0),
    profitMarginPercent: Number(form.profitMarginPercent) || 0,
    laborPoints: Number(form.laborPoints) || 0,
    subtotal: Number(form.subtotal) || 0,
    tax: form.taxIncluded === false ? 0 : undefined,
    internalNotes: form.internalNotes?.trim() || undefined,
    commercialTerms: form.commercialTerms?.trim() || undefined,
    executionTime: form.executionTime?.trim() || undefined,
    warranty: form.warranty?.trim() || undefined,
    paymentTerms: form.paymentTerms?.trim() || undefined,
    items: cleanItems?.length ? cleanItems : undefined,
  };
}

function cleanMeetingPayload(form: MeetingPayload): MeetingPayload {
  return {
    customerId: form.customerId,
    dateTime: form.dateTime,
    contact: form.contact?.trim() || undefined,
    type: form.type,
    status: form.status,
    objective: form.objective.trim(),
    notes: form.notes?.trim() || undefined,
    commitments: form.commitments?.trim() || undefined,
    nextStep: form.nextStep?.trim() || undefined,
    followUpDate: form.followUpDate || undefined,
    attendees: form.attendees?.trim() || undefined,
    needs: form.needs?.trim() || undefined,
    equipmentNeeded: form.equipmentNeeded?.trim() || undefined,
    estimatedBudget: Number(form.estimatedBudget) || undefined,
    closeProbability: Number(form.closeProbability) || undefined,
    reminderEnabled: form.reminderEnabled ?? true,
    reminderMinutesBefore: Number(form.reminderMinutesBefore) || 30,
    attachments: form.attachments?.length
      ? form.attachments.map((attachment) => ({
          name: attachment.name.trim(),
          mimeType: attachment.mimeType,
          size: attachment.size,
          dataUrl: attachment.dataUrl,
        }))
      : undefined,
  };
}

function cleanPaymentPayload(form: PaymentPayload): PaymentPayload {
  return {
    customerId: form.customerId,
    concept: form.concept.trim(),
    amount: Number(form.amount) || 0,
    dueDate: form.dueDate || undefined,
    paidAt: form.paidAt || undefined,
  };
}

function cleanVehiclePayload(form: VehiclePayload): VehiclePayload {
  return {
    name: form.name.trim(),
    plate: form.plate?.trim() || undefined,
    traccarDeviceId: form.traccarDeviceId?.trim() || undefined,
    fuelKmPerLiter: Number(form.fuelKmPerLiter) || undefined,
    active: form.active,
  };
}

function cleanInventoryPayload(form: InventoryItemPayload): InventoryItemPayload {
  return {
    sku: form.sku?.trim() || undefined,
    name: form.name.trim(),
    category: form.category || undefined,
    unit: form.unit?.trim() || "u",
    stock: Number(form.stock) || 0,
    minStock: 0,
    managedStock: form.managedStock ?? true,
    location: form.location?.trim() || undefined,
    supplier: form.supplier?.trim() || undefined,
    supplierCategory: form.supplierCategory?.trim() || undefined,
    costPrice: form.costPrice,
    taxAmount: form.taxAmount,
    priceWithTax: form.priceWithTax,
    currency: form.currency?.trim() || undefined,
    notes: form.notes?.trim() || undefined,
  };
}

function cleanInventoryMovementPayload(form: InventoryMovementPayload): InventoryMovementPayload {
  return {
    itemId: form.itemId,
    type: form.type,
    quantity: Number(form.quantity) || 0,
    reason: form.reason?.trim() || undefined,
    workOrderId: form.workOrderId || undefined,
    installedDeviceId: form.installedDeviceId || undefined,
  };
}

function isOverdue(payment: Payment) {
  if (payment.paidAt || !payment.dueDate) {
    return false;
  }

  return startOfDay(new Date(payment.dueDate)).getTime() < startOfDay(new Date()).getTime();
}

function paymentStatusLabel(payment: Payment) {
  if (payment.paidAt) {
    return "Pagado";
  }

  return isOverdue(payment) ? "Vencido" : "Pendiente";
}

function paymentStatusClass(payment: Payment) {
  if (payment.paidAt) {
    return "completed";
  }

  return isOverdue(payment) ? "cancelled" : "scheduled";
}

function meetingStatusClass(status: MeetingStatus) {
  if (status === "DONE") {
    return "completed";
  }

  return status === "CANCELLED" ? "cancelled" : "scheduled";
}

function workOrderStatusClass(status: WorkOrderStatus) {
  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "CANCELLED") {
    return "cancelled";
  }

  if (status === "IN_PROGRESS") {
    return "in_progress";
  }

  if (status === "WAITING_CUSTOMER") {
    return "waiting_customer";
  }

  return "scheduled";
}

function readMeetingAttachment(file: File): Promise<NonNullable<MeetingPayload["attachments"]>[number]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("No se pudo leer el archivo"));
        return;
      }

      resolve({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function toMoneyNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function formatCurrency(value: string | number) {
  const amount = toMoneyNumber(value);
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatNumber(value: string | number, maximumFractionDigits = 2) {
  const amount = toMoneyNumber(value);
  return new Intl.NumberFormat("es-UY", {
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDuration(totalMinutes: string | number) {
  const minutes = Math.max(0, Math.round(toMoneyNumber(totalMinutes)));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

type DispatchStopKind = "CLIENT" | "NOT_CLIENT" | "WAREHOUSE" | "LUNCH" | "TRANSFER";

type DispatchRouteStop = {
  workOrder: WorkOrder;
  latitude: number;
  longitude: number;
  siteLabel: string;
  zone: string;
  estimatedMinutes: number;
  legKm: number;
};

type DispatchBaseSettings = {
  companyName?: string | null;
  companyAddress?: string | null;
  companyLatitude?: string | number | null;
  companyLongitude?: string | number | null;
};

type DispatchBaseLocation = {
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
};

type DispatchPlanOverrides = {
  durations?: Record<string, number>;
  zones?: Record<string, string>;
};

function buildDispatchPlan(workOrders: WorkOrder[], baseSettings?: DispatchBaseSettings | null, overrides: DispatchPlanOverrides = {}) {
  const baseLocation = resolveDispatchBaseLocation(baseSettings);
  const scheduledOrders = [...workOrders].sort((left, right) => {
    const leftTime = left.scheduledAt ? new Date(left.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.scheduledAt ? new Date(right.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });
  const routableStops = scheduledOrders
    .map((workOrder) => {
      const location = resolveWorkOrderLocation(workOrder);
      if (!location) {
        return null;
      }

      return {
        workOrder,
        ...location,
        siteLabel: getWorkOrderRouteSite(workOrder)?.name || getWorkOrderRouteSite(workOrder)?.address || workOrder.customer.address || "Sin sitio",
        zone: overrides.zones?.[workOrder.id]?.trim() || inferZone(getWorkOrderRouteSite(workOrder)?.address || workOrder.customer.address || workOrder.customer.name),
        estimatedMinutes: overrides.durations?.[workOrder.id] ?? estimateWorkOrderMinutes(workOrder),
        legKm: 0,
      } satisfies DispatchRouteStop;
    })
    .filter((stop): stop is DispatchRouteStop => Boolean(stop));

  const missingLocation = scheduledOrders.filter((workOrder) => !resolveWorkOrderLocation(workOrder));
  const orderedStops = nearestNeighborStops(routableStops, baseLocation);
  const stopsWithLegs = orderedStops.map((stop, index) => {
    const previous = orderedStops[index - 1];
    const origin = previous ?? baseLocation;
    return {
      ...stop,
      legKm: origin ? roundNumber(haversineKm(origin.latitude, origin.longitude, stop.latitude, stop.longitude), 2) : 0,
    };
  });
  const lastStop = stopsWithLegs[stopsWithLegs.length - 1];
  const returnKm = lastStop && baseLocation
    ? roundNumber(haversineKm(lastStop.latitude, lastStop.longitude, baseLocation.latitude, baseLocation.longitude), 2)
    : 0;
  const estimatedKm = roundNumber(stopsWithLegs.reduce((sum, stop) => sum + stop.legKm, 0) + returnKm, 2);
  const estimatedMinutes = stopsWithLegs.reduce((sum, stop) => sum + stop.estimatedMinutes, 0);
  const zones = Array.from(new Set(stopsWithLegs.map((stop) => stop.zone).filter(Boolean)));
  const alerts = [
    !baseLocation ? "Configura coordenadas de empresa para calcular salida y regreso." : "",
    missingLocation.length ? `${missingLocation.length} trabajo(s) sin coordenadas para optimizar.` : "",
    stopsWithLegs.length && missingLocation.length ? "La ruta sugerida no incluye trabajos sin ubicacion." : "",
    !stopsWithLegs.length && workOrders.length ? "Carga ubicacion en clientes/sitios para organizar la ruta." : "",
    stopsWithLegs.length > 6 ? "Jornada cargada: revisa duraciones antes de confirmar." : "",
  ].filter(Boolean);

  return {
    routableStops,
    orderedStops: stopsWithLegs,
    missingLocation,
    baseLocation,
    returnKm,
    estimatedKm,
    estimatedMinutes,
    zones,
    alerts,
    strategy: stopsWithLegs.length > 1 ? "Cercania" : "Manual",
  };
}

function buildGoogleMapsRouteUrl(stops: DispatchRouteStop[], baseLocation?: DispatchBaseLocation | null) {
  if (!stops.length) {
    return "";
  }

  const coords = stops.map((stop) => `${stop.latitude},${stop.longitude}`);
  if (coords.length === 1 && !baseLocation) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords[0])}`;
  }

  const baseCoords = baseLocation ? `${baseLocation.latitude},${baseLocation.longitude}` : "";
  const origin = baseCoords || coords[0];
  const destination = baseCoords || coords[coords.length - 1];
  const waypoints = (baseLocation ? coords : coords.slice(1, -1)).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });

  if (waypoints) {
    params.set("waypoints", waypoints);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildDispatchRouteText(stops: DispatchRouteStop[], vehicle: Vehicle | null, baseLocation?: DispatchBaseLocation | null) {
  if (!stops.length) {
    return "";
  }

  const lines = [
    "Ruta operativa Security Solutions",
    vehicle ? `Movil: ${vehicle.name}${vehicle.plate ? ` (${vehicle.plate})` : ""}` : "Movil: sin asignar",
    baseLocation ? `Salida: ${baseLocation.name} - ${baseLocation.address || `${baseLocation.latitude},${baseLocation.longitude}`}` : "Salida: sin base configurada",
    "",
    ...stops.map((stop, index) => {
      const time = formatTime(stop.workOrder.scheduledAt);
      return `${index + 1}. ${time} - ${stop.workOrder.customer.name} - ${stop.siteLabel} - ${stop.workOrder.title}`;
    }),
    baseLocation ? `Regreso: ${baseLocation.name}` : "",
  ];

  return lines.join("\n");
}

function buildDispatcherDailySummary(
  plan: ReturnType<typeof buildDispatchPlan>,
  workOrders: WorkOrder[],
  vehicle: Vehicle | null,
  dailySummary: VehicleDailySummary | null,
) {
  const fuelKmPerLiter = Number(vehicle?.fuelKmPerLiter) || 10;
  const fallbackLiters = fuelKmPerLiter > 0 ? roundNumber(plan.estimatedKm / fuelKmPerLiter, 2) : 0;
  const fallbackFuelCost = roundNumber(fallbackLiters * (dailySummary?.fuelPricePerLiter || 88.67), 2);
  const visitNames = dailySummary?.visits?.length
    ? Array.from(new Set(dailySummary.visits.map((visit) => `${visit.customerName}${visit.siteName ? ` - ${visit.siteName}` : ""}`)))
    : Array.from(new Set(plan.orderedStops.map((stop) => stop.workOrder.customer.name)));

  return {
    distanceKm: dailySummary?.positions ? dailySummary.distanceKm : plan.estimatedKm,
    operationalMinutes: dailySummary?.positions ? dailySummary.movingMinutes + dailySummary.stoppedMinutes : plan.estimatedMinutes,
    estimatedLiters: dailySummary?.positions ? dailySummary.estimatedLiters : fallbackLiters,
    estimatedFuelCost: dailySummary?.positions ? dailySummary.estimatedFuelCost : fallbackFuelCost,
    visitedClients: dailySummary?.visits?.length ? new Set(dailySummary.visits.map((visit) => visit.customerId)).size : workOrders.length,
    visitNames,
  };
}

function mergeDateAndTime(date: Date, time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  const merged = new Date(date);
  merged.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return merged;
}

function formatInputTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function nearestNeighborStops(stops: DispatchRouteStop[], baseLocation?: DispatchBaseLocation | null) {
  const pending = [...stops];
  const ordered: DispatchRouteStop[] = [];
  let current: DispatchRouteStop | DispatchBaseLocation | undefined = baseLocation ?? pending.shift();

  if (current && "workOrder" in current) {
    ordered.push(current);
  }

  while (current && pending.length) {
    let nextIndex = 0;
    let nextDistance = Number.POSITIVE_INFINITY;
    pending.forEach((candidate, index) => {
      const distance = haversineKm(current!.latitude, current!.longitude, candidate.latitude, candidate.longitude);
      if (distance < nextDistance) {
        nextDistance = distance;
        nextIndex = index;
      }
    });
    current = pending.splice(nextIndex, 1)[0];
    ordered.push(current);
  }

  return ordered;
}

function resolveDispatchBaseLocation(baseSettings?: DispatchBaseSettings | null) {
  if (!baseSettings) {
    return null;
  }

  const directCoords = resolveOperationalCoordinates(baseSettings.companyLatitude, baseSettings.companyLongitude);
  if (directCoords) {
    return {
      name: baseSettings.companyName || "Security Solutions",
      address: baseSettings.companyAddress,
      ...directCoords,
    } satisfies DispatchBaseLocation;
  }

  const addressCoords = parseCoordinatesFromText(baseSettings.companyAddress);
  return addressCoords
    ? {
        name: baseSettings.companyName || "Security Solutions",
        address: baseSettings.companyAddress,
        ...addressCoords,
      } satisfies DispatchBaseLocation
    : null;
}

function hasCoordinates(latitude?: string | number | null, longitude?: string | number | null) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) && !(lat === 0 && lon === 0);
}

function applyCoordinatesFromText<T extends { address?: string; latitude?: number | null; longitude?: number | null }>(form: T): T {
  const coords = parseCoordinatesFromText(form.address);
  if (!coords) {
    return form;
  }

  return {
    ...form,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

function formatCoordinate(value?: string | number | null) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate.toFixed(6) : "";
}

function buildGeoStatusText(latitude?: string | number | null, longitude?: string | number | null, emptyMessage = "Sin coordenadas") {
  const coords = resolveOperationalCoordinates(latitude, longitude);
  if (coords) {
    return `GPS listo: ${formatCoordinate(coords.latitude)}, ${formatCoordinate(coords.longitude)}`;
  }

  if (hasCoordinates(latitude, longitude)) {
    return "Coordenadas fuera de Uruguay o incompletas: corrige latitud y longitud.";
  }

  return emptyMessage;
}

function resolveWorkOrderLocation(workOrder: WorkOrder) {
  const siteCoords = resolveOperationalCoordinates(workOrder.site?.latitude, workOrder.site?.longitude);
  if (siteCoords) {
    return siteCoords;
  }

  const siteAddressCoords = parseCoordinatesFromText(workOrder.site?.address);
  if (siteAddressCoords) {
    return siteAddressCoords;
  }

  const fallbackSite = getWorkOrderRouteSite(workOrder);
  if (fallbackSite && fallbackSite.id !== workOrder.site?.id) {
    const fallbackSiteCoords = resolveOperationalCoordinates(fallbackSite.latitude, fallbackSite.longitude);
    if (fallbackSiteCoords) {
      return fallbackSiteCoords;
    }

    const fallbackAddressCoords = parseCoordinatesFromText(fallbackSite.address);
    if (fallbackAddressCoords) {
      return fallbackAddressCoords;
    }
  }

  const customerCoords = resolveOperationalCoordinates(workOrder.customer.latitude, workOrder.customer.longitude);
  if (customerCoords) {
    return customerCoords;
  }

  return parseCoordinatesFromText(workOrder.customer.address);
}

function getWorkOrderRouteSite(workOrder: WorkOrder) {
  if (workOrder.site) {
    return workOrder.site;
  }

  return workOrder.customer.sites?.find((site) => resolveOperationalCoordinates(site.latitude, site.longitude) || parseCoordinatesFromText(site.address)) ?? null;
}

function getGeoZoneInfo(target: GeoZoneTarget) {
  const directCoordinates = resolveOperationalCoordinates(target.latitude, target.longitude);
  const parsedCoordinates = directCoordinates ?? parseCoordinatesFromText(target.address);
  const address = target.address?.trim();
  const synced = Boolean(target.traccarGeofenceId);
  const active = Boolean(parsedCoordinates || synced);
  const mapQuery = parsedCoordinates
    ? `${parsedCoordinates.latitude},${parsedCoordinates.longitude}`
    : address || "";

  return {
    active,
    synced,
    mapUrl: mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : "",
  };
}

function estimateWorkOrderMinutes(workOrder: WorkOrder) {
  const title = `${workOrder.title} ${workOrder.notes ?? ""}`.toLowerCase();
  if (title.includes("dvr") || title.includes("nvr") || title.includes("rack")) {
    return 180;
  }
  if (title.includes("camara") || title.includes("cámara")) {
    return 45;
  }
  if (title.includes("bateria") || title.includes("batería")) {
    return 25;
  }
  if (title.includes("gps")) {
    return 30;
  }

  const byType: Record<DeviceType, number> = {
    CCTV: 120,
    ALARM: 75,
    ACCESS_CONTROL: 90,
    CABLING: 150,
    GPS: 30,
    ELECTRIC_FENCE: 120,
    AUTOMATION: 120,
    NETWORKING: 90,
    MAINTENANCE: 60,
    OTHER: 60,
  };

  return byType[workOrder.type] ?? 60;
}

function inferZone(value?: string | null) {
  const clean = normalizeText(value);
  const zones = ["carrasco", "centro", "pocitos", "malvin", "malvín", "ciudad de la costa", "cordon", "cordón", "buceo", "prado"];
  const zone = zones.find((candidate) => clean.includes(normalizeText(candidate)));
  return zone ? titleCase(zone.replace("malvin", "malvin").replace("cordon", "cordon")) : "Zona sin clasificar";
}

function parseCoordinatesFromText(value?: string | null) {
  const text = value?.trim();
  if (!text) {
    return null;
  }

  const decoded = safeDecodeURIComponent(text);
  const patterns = [
    /@(-?\d{1,2}(?:[.,]\d+)?),\s*(-?\d{1,3}(?:[.,]\d+)?)/,
    /[?&](?:q|query|ll)=(-?\d{1,2}(?:[.,]\d+)?),\s*(-?\d{1,3}(?:[.,]\d+)?)/,
    /!3d(-?\d{1,2}(?:[.,]\d+)?)!4d(-?\d{1,3}(?:[.,]\d+)?)/,
    /(?:^|\s)(-?\d{1,2}[.,]\d{3,})\s*,\s*(-?\d{1,3}[.,]\d{3,})(?:\s|$)/,
    /(?:^|\s)(-?\d{1,2}[.,]\d{3,})\s+(-?\d{1,3}[.,]\d{3,})(?:\s|$)/,
  ];
  const match = patterns.map((pattern) => decoded.match(pattern)).find(Boolean);
  if (!match) {
    return null;
  }

  const latitude = Number(match[1].replace(",", "."));
  const longitude = Number(match[2].replace(",", "."));
  return isValidLatitude(latitude) && isValidLongitude(longitude) && isUruguayCoordinate(latitude, longitude) && !(latitude === 0 && longitude === 0)
    ? { latitude, longitude }
    : null;
}

function hasOperationalCoordinates(latitude?: string | number | null, longitude?: string | number | null) {
  return Boolean(resolveOperationalCoordinates(latitude, longitude));
}

function resolveOperationalCoordinates(latitude?: string | number | null, longitude?: string | number | null) {
  const normalized = normalizeCompanyCoordinates(toOptionalCoordinateNumber(latitude), toOptionalCoordinateNumber(longitude));
  if (!normalized || normalized.latitude === undefined || normalized.longitude === undefined) {
    return null;
  }

  return normalized;
}

function toOptionalCoordinateNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function normalizeCompanyCoordinates(latitude?: number, longitude?: number) {
  const normalizedLatitude = normalizePackedUruguayCoordinate(latitude, "latitude");
  const normalizedLongitude = normalizePackedUruguayCoordinate(longitude, "longitude");

  if (normalizedLatitude === undefined && normalizedLongitude === undefined) {
    return { latitude: undefined, longitude: undefined };
  }

  if (normalizedLatitude === undefined || normalizedLongitude === undefined) {
    return null;
  }

  if (!isValidLatitude(normalizedLatitude) || !isValidLongitude(normalizedLongitude)) {
    return null;
  }

  if (!isUruguayCoordinate(normalizedLatitude, normalizedLongitude)) {
    return null;
  }

  return {
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
  };
}

function normalizePackedUruguayCoordinate(value: number | undefined, kind: "latitude" | "longitude") {
  if (value === undefined || value === null || value === 0 || !Number.isFinite(value)) {
    return undefined;
  }

  if (kind === "latitude" && Math.abs(value) <= 90) {
    return value;
  }

  if (kind === "longitude" && Math.abs(value) <= 180) {
    return value;
  }

  const sign = value < 0 ? -1 : 1;
  const digits = String(Math.trunc(Math.abs(value)));
  const expectedPrefix = kind === "latitude" ? "34" : "56";

  if (digits.startsWith(expectedPrefix) && digits.length > 2) {
    return sign * (Number(digits.slice(0, 2)) + Number(`0.${digits.slice(2)}`));
  }

  return value;
}

function isUruguayCoordinate(latitude: number, longitude: number) {
  return latitude >= -35.2 && latitude <= -30 && longitude >= -58.6 && longitude <= -53;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function roundNumber(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPrice(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") {
    return "Sin precio";
  }

  const amount = toMoneyNumber(value);
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuoteTerm(value?: string | null, unit: "dia" | "mes" = "dia") {
  const clean = value?.trim();
  if (!clean) {
    return "Sin definir";
  }

  if (!/^\d+(?:[.,]\d+)?$/.test(clean)) {
    return clean;
  }

  const amount = Number(clean.replace(",", "."));
  const label =
    unit === "dia"
      ? amount === 1
        ? "dia"
        : "dias"
      : amount === 1
        ? "mes"
        : "meses";

  return `${clean} ${label}`;
}

function formatAddressParts(value?: string | null) {
  if (!value?.trim()) {
    return { primary: "", secondary: "" };
  }

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return { primary: value.trim(), secondary: "" };
  }

  const firstStreetIndex = parts.findIndex((part) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(part) && !/^\d/.test(part));
  const leadingDoorNumbers = firstStreetIndex > 0 ? parts.slice(0, firstStreetIndex) : [];
  const street = firstStreetIndex > -1 ? parts[firstStreetIndex] : parts[0];
  const doorNumber = leadingDoorNumbers[0] ?? "";
  const primary = doorNumber ? `${street} ${doorNumber}` : street;
  const secondary = (firstStreetIndex > -1 ? parts.slice(firstStreetIndex + 1) : parts.slice(1))
    .filter((part) => !/^\d{5}$/.test(part) && part.toLowerCase() !== "uruguay")
    .slice(0, 2)
    .join(", ");

  return { primary, secondary };
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return startOfDay(new Date());
  }

  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isSameDay(value: string | Date | null | undefined, date: Date) {
  if (!value) {
    return false;
  }

  const source = value instanceof Date ? value : new Date(value);
  return startOfDay(source).getTime() === startOfDay(date).getTime();
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleString("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatShortDateTime(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "intentalo de nuevo";
}

function isExpiredJwt(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return true;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as { exp?: number };

    return typeof decodedPayload.exp === "number" && decodedPayload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortWeekday(date: Date) {
  return date.toLocaleDateString("es-UY", { weekday: "short" });
}

function formatShortDate(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatInventoryDate(value?: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) {
    return "--:--";
  }

  return new Date(value).toLocaleTimeString("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupWhatsAppChats(chats: WhatsAppChat[], groups: WhatsAppChat[], customers: Customer[]) {
  const sections = new Map<string, { title: string; caption: string; chats: WhatsAppChat[] }>();
  const addToSection = (title: string, caption: string, chat: WhatsAppChat) => {
    if (!sections.has(title)) {
      sections.set(title, { title, caption, chats: [] });
    }
    sections.get(title)?.chats.push(chat);
  };
  const customerPhones = new Set(customers.map((customer) => normalizeWhatsAppComparable(customer.phone)).filter(Boolean));

  chats.forEach((chat) => {
    const label = getWhatsAppListLabel(chat);
    if (label) {
      addToSection(label, "Lista de WhatsApp", chat);
      return;
    }

    const chatPhone = normalizeWhatsAppComparable(chat.id);
    const chatName = `${chat.name ?? ""} ${chat.id}`.toLowerCase();
    if (customerPhones.has(chatPhone)) {
      addToSection("Clientes", "Contactos vinculados al CRM", chat);
    } else if (chatName.includes("security solutions") || chatName.includes("securitysolutions") || chatName.includes("sscc")) {
      addToSection("Security Solutions", "Equipo interno y operacion", chat);
    } else {
      addToSection("Nuevo cliente", "Contactos sin ficha en el CRM", chat);
    }
  });

  groups.forEach((group) => {
    const label = getWhatsAppListLabel(group);
    addToSection(label || "Grupos", label ? "Lista de WhatsApp" : "Grupos sincronizados", { ...group, isGroup: true });
  });

  const order = ["Clientes", "Security Solutions", "Nuevo cliente", "Grupos"];
  return Array.from(sections.values()).sort((left, right) => {
    const leftIndex = order.indexOf(left.title);
    const rightIndex = order.indexOf(right.title);
    if (leftIndex !== -1 || rightIndex !== -1) {
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    }
    return left.title.localeCompare(right.title);
  });
}

function getWhatsAppListLabel(chat: WhatsAppChat) {
  const labels = chat.labels
    ?.map((label) => (typeof label === "string" ? label : label.name || label.label || label.title || ""))
    .filter(Boolean);
  return labels?.[0] || chat.label || chat.category || "";
}

function normalizeWhatsAppComparable(value?: string | null) {
  return (value ?? "").replace(/\D/g, "").replace(/^598/, "");
}

function formatWhatsAppTime(value?: number) {
  if (!value) {
    return "Sin fecha";
  }

  const milliseconds = value > 9999999999 ? value : value * 1000;
  return new Date(milliseconds).toLocaleString("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

type GroupedWorkOrderMaterial = {
  key: string;
  ids: string[];
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  deviceDetails: string[];
};

type GroupedInstalledDevice = {
  key: string;
  sample: InstalledDevice;
  type: DeviceType;
  brand: string;
  model: string;
  quantity: number;
  customers: string;
  sites: string;
  serialCount: number;
  notes: string;
  clientGroups: GroupedInstalledDeviceClient[];
};

type GroupedInstalledDeviceClient = {
  customerId: string;
  customerName: string;
  quantity: number;
  orders: GroupedInstalledDeviceOrder[];
};

type GroupedInstalledDeviceOrder = {
  key: string;
  title: string;
  quantity: number;
  date?: string | null;
  siteNames: string[];
};

function groupInstalledDevices(devices: InstalledDevice[]): GroupedInstalledDevice[] {
  const groups = new Map<
    string,
    GroupedInstalledDevice & {
      customerNames: Set<string>;
      siteNames: Set<string>;
      serials: Set<string>;
      notesList: string[];
      clients: Map<
        string,
        {
          customerId: string;
          customerName: string;
          quantity: number;
          orders: Map<
            string,
            {
              key: string;
              title: string;
              quantity: number;
              date?: string | null;
              siteNames: Set<string>;
            }
          >;
        }
      >;
    }
  >();

  for (const device of devices) {
    const brand = device.brand?.trim() ?? "";
    const model = device.model?.trim() || "Equipo sin modelo";
    const key = [device.type, brand.toLowerCase(), model.toLowerCase()].join("|");
    const order = device.inventoryMovements?.[0]?.workOrder;
    const orderKey = order?.id ?? `sin-orden-${device.site.customer.id}`;
    const orderTitle = order?.title ?? "Sin orden de trabajo relacionada";
    const orderDate = order?.completedAt ?? order?.scheduledAt ?? device.installedAt ?? device.createdAt;
    const current = groups.get(key);

    if (current) {
      current.quantity += 1;
      current.customerNames.add(device.site.customer.name);
      current.siteNames.add(device.site.name);
      if (device.serial?.trim()) {
        current.serials.add(device.serial.trim());
      }
      if (device.notes?.trim()) {
        current.notesList.push(device.notes.trim());
      }
      current.customers = summarizeNames(current.customerNames);
      current.sites = summarizeNames(current.siteNames);
      current.serialCount = current.serials.size;
      current.notes = current.notesList[0] ?? "";
      addDeviceToClientGroup(current.clients, device, orderKey, orderTitle, orderDate);
      current.clientGroups = buildInstalledDeviceClientGroups(current.clients);
      continue;
    }

    const customerNames = new Set([device.site.customer.name]);
    const siteNames = new Set([device.site.name]);
    const serials = new Set<string>();
    if (device.serial?.trim()) {
      serials.add(device.serial.trim());
    }
    const notesList = device.notes?.trim() ? [device.notes.trim()] : [];
    const clients = addDeviceToClientGroup(new Map(), device, orderKey, orderTitle, orderDate);

    groups.set(key, {
      key,
      sample: device,
      type: device.type,
      brand,
      model,
      quantity: 1,
      customers: summarizeNames(customerNames),
      sites: summarizeNames(siteNames),
      serialCount: serials.size,
      notes: notesList[0] ?? "",
      clientGroups: buildInstalledDeviceClientGroups(clients),
      customerNames,
      siteNames,
      serials,
      notesList,
      clients,
    });
  }

  return Array.from(groups.values()).map(({ customerNames, siteNames, serials, notesList, clients, ...group }) => group);
}

function summarizeNames(names: Set<string>) {
  const values = Array.from(names).filter(Boolean);
  if (!values.length) {
    return "-";
  }

  if (values.length <= 2) {
    return values.join(", ");
  }

  return `${values.slice(0, 2).join(", ")} +${values.length - 2}`;
}

function filterInstalledDeviceClientGroups(groups: GroupedInstalledDeviceClient[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return groups;
  }

  return groups
    .map((client) => {
      const clientMatches = client.customerName.toLowerCase().includes(normalizedQuery);
      const orders = client.orders.filter((order) => {
        const searchable = [order.title, ...order.siteNames].join(" ").toLowerCase();
        return clientMatches || searchable.includes(normalizedQuery);
      });

      return orders.length ? { ...client, orders } : null;
    })
    .filter((client): client is GroupedInstalledDeviceClient => Boolean(client));
}

function addDeviceToClientGroup(
  clients: Map<
    string,
    {
      customerId: string;
      customerName: string;
      quantity: number;
      orders: Map<
        string,
        {
          key: string;
          title: string;
          quantity: number;
          date?: string | null;
          siteNames: Set<string>;
        }
      >;
    }
  >,
  device: InstalledDevice,
  orderKey: string,
  orderTitle: string,
  orderDate?: string | null,
) {
  const customer = device.site.customer;
  const client = clients.get(customer.id) ?? {
    customerId: customer.id,
    customerName: customer.name,
    quantity: 0,
    orders: new Map(),
  };
  const order = client.orders.get(orderKey) ?? {
    key: orderKey,
    title: orderTitle,
    quantity: 0,
    date: orderDate,
    siteNames: new Set<string>(),
  };

  client.quantity += 1;
  order.quantity += 1;
  order.siteNames.add(device.site.name);
  client.orders.set(orderKey, order);
  clients.set(customer.id, client);

  return clients;
}

function buildInstalledDeviceClientGroups(
  clients: Map<
    string,
    {
      customerId: string;
      customerName: string;
      quantity: number;
      orders: Map<
        string,
        {
          key: string;
          title: string;
          quantity: number;
          date?: string | null;
          siteNames: Set<string>;
        }
      >;
    }
  >,
): GroupedInstalledDeviceClient[] {
  return Array.from(clients.values()).map((client) => ({
    customerId: client.customerId,
    customerName: client.customerName,
    quantity: client.quantity,
    orders: Array.from(client.orders.values()).map((order) => ({
      key: order.key,
      title: order.title,
      quantity: order.quantity,
      date: order.date,
      siteNames: Array.from(order.siteNames),
    })),
  }));
}

function groupWorkOrderMaterials(movements: InventoryMovement[]): GroupedWorkOrderMaterial[] {
  const groups = new Map<string, GroupedWorkOrderMaterial>();

  for (const movement of movements) {
    const name = movement.item?.name ?? "Articulo";
    const sku = movement.item?.sku ?? "";
    const unit = movement.item?.unit ?? "";
    const key = movement.itemId || `${name}-${sku}-${unit}`;
    const detail = [
      movement.installedDevice?.brand,
      movement.installedDevice?.model,
      movement.installedDevice?.serial ? `Serie ${movement.installedDevice.serial}` : "",
      movement.installedDevice?.ipAddress ? `IP ${movement.installedDevice.ipAddress}` : "",
    ]
      .filter(Boolean)
      .join(" - ");

    const current = groups.get(key);
    if (current) {
      current.ids.push(movement.id);
      current.quantity += movement.quantity;
      if (detail && !current.deviceDetails.includes(detail)) {
        current.deviceDetails.push(detail);
      }
      continue;
    }

    groups.set(key, {
      key,
      ids: [movement.id],
      name,
      sku,
      unit,
      quantity: movement.quantity,
      deviceDetails: detail ? [detail] : [],
    });
  }

  return Array.from(groups.values());
}

function toWhatsAppPhone(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith("598")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `598${digits.slice(1)}`;
  }

  return digits.length <= 9 ? `598${digits}` : digits;
}

function buildWorkOrderShareText(workOrder: WorkOrder) {
  const documentNumber = formatWorkOrderNumber(workOrder);
  const site = workOrder.site ? `${workOrder.site.name} - ${workOrder.site.address}` : "Sin sitio especifico";
  const groupedMaterials = groupWorkOrderMaterials(workOrder.inventoryMovements ?? []);
  const materials = groupedMaterials.length
    ? groupedMaterials
        .map((movement) => `- ${movement.name} x${movement.quantity} ${movement.unit}`)
        .join("\n")
    : "- Sin materiales cargados";

  return [
    `Orden de trabajo ${documentNumber}`,
    `Cliente: ${workOrder.customer.name}`,
    `Trabajo: ${workOrder.title}`,
    `Tipo: ${deviceTypeLabels[workOrder.type]}`,
    `Sitio: ${site}`,
    `Finalizado: ${formatDateTime(workOrder.completedAt ?? workOrder.updatedAt)}`,
    "",
    "Materiales/equipos:",
    materials,
    "",
    "Security Solutions",
  ].join("\n");
}

function buildQuoteShareText(quote: Quote) {
  const items = quote.items?.length
    ? quote.items
        .map((item) => `- ${item.description}: ${item.quantity} ${item.unit} x ${formatPrice(item.unitPrice, quote.currency)}`)
        .join("\n")
    : "- Segun detalle acordado";

  return [
    `Presupuesto ${quote.number}`,
    `Cliente: ${quote.customer.name}`,
    `Servicio: ${deviceTypeLabels[quote.service]}`,
    `Titulo: ${quote.title}`,
    "",
    "Items:",
    items,
    "",
    `Subtotal: ${formatPrice(quote.subtotal, quote.currency)}`,
    quote.discountAmount ? `Descuento: ${formatPrice(quote.discountAmount, quote.currency)}` : "",
    quote.taxIncluded ? `IVA 22%: ${formatPrice(quote.tax, quote.currency)}` : "IVA: no aplicado",
    `Total: ${formatPrice(quote.total, quote.currency)}`,
    "",
    quote.executionTime ? `Tiempo de ejecucion: ${formatQuoteTerm(quote.executionTime, "dia")}` : "",
    quote.warranty ? `Garantia: ${formatQuoteTerm(quote.warranty, "mes")}` : "",
    quote.paymentTerms ? `Forma de pago: ${quote.paymentTerms}` : "",
    quote.commercialTerms ? `Condiciones: ${quote.commercialTerms}` : "",
    "",
    "Quedamos a las ordenes.",
    "Security Solutions",
  ].filter(Boolean).join("\n");
}

function buildQuoteWorkOrderNotes(quote: Quote) {
  const items = quote.items?.length
    ? quote.items
        .map((item) => `- ${item.description}: ${item.quantity} ${item.unit} x ${formatPrice(item.unitPrice, quote.currency)}`)
        .join("\n")
    : "Sin items cargados";

  return [
    `Generado desde presupuesto ${quote.number}`,
    `Cliente: ${quote.customer.name}`,
    `Servicio: ${deviceTypeLabels[quote.service]}`,
    `Total aprobado: ${formatPrice(quote.total, quote.currency)}`,
    quote.executionTime ? `Tiempo de ejecucion estimado: ${formatQuoteTerm(quote.executionTime, "dia")}` : "",
    quote.warranty ? `Garantia: ${formatQuoteTerm(quote.warranty, "mes")}` : "",
    quote.paymentTerms ? `Forma de pago: ${quote.paymentTerms}` : "",
    quote.commercialTerms ? `Condiciones comerciales: ${quote.commercialTerms}` : "",
    "",
    "Items aprobados:",
    items,
  ].filter(Boolean).join("\n");
}

type ParsedWorkOrderQuoteNotes = {
  number: string;
  total?: string;
  executionTime?: string;
  warranty?: string;
  paymentTerms?: string;
  commercialTerms?: string;
  items: string[];
};

function parseWorkOrderQuoteNotes(notes?: string | null): ParsedWorkOrderQuoteNotes | null {
  if (!notes?.includes("Generado desde presupuesto")) {
    return null;
  }

  const lines = notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines.find((line) => line.startsWith("Generado desde presupuesto"));
  const number = firstLine?.replace("Generado desde presupuesto", "").trim() || "Sin numero";
  const readValue = (label: string) => {
    const line = lines.find((item) => item.startsWith(`${label}:`));
    return line?.slice(label.length + 1).trim();
  };
  const itemsStart = lines.findIndex((line) => line === "Items aprobados:");
  const items = itemsStart >= 0
    ? lines
        .slice(itemsStart + 1)
        .map((line) => line.replace(/^-\s*/, "").trim())
        .filter(Boolean)
    : [];

  return {
    number,
    total: readValue("Total aprobado"),
    executionTime: readValue("Tiempo de ejecucion estimado"),
    warranty: readValue("Garantia"),
    paymentTerms: readValue("Forma de pago"),
    commercialTerms: readValue("Condiciones comerciales"),
    items,
  };
}

async function buildQuoteTemplateAttachment(quote: Quote) {
  const [logo, watermark] = await Promise.all([
    imageToDataUrl("/security-solutions-logo.png"),
    imageToDataUrl("/security-solutions-logo-bw.png"),
  ]);
  const html = buildQuoteTemplateHtml(quote, logo, watermark);

  return {
    name: `${quote.number}-${sanitizeFileName(quote.title || "presupuesto")}.html`,
    mimeType: "text/html",
    dataUrl: `data:text/html;charset=utf-8;base64,${base64EncodeUnicode(html)}`,
  };
}

async function downloadQuoteTemplatePdf(quote: Quote) {
  if (typeof window === "undefined") {
    return;
  }

  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const [logo, watermark] = await Promise.all([
    imageToDataUrl("/security-solutions-logo.png"),
    imageToDataUrl("/security-solutions-logo-bw.png"),
  ]);
  const html = buildQuoteTemplateHtml(quote, logo, watermark);
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error("No se pudo preparar el PDF."));
      iframe.srcdoc = html;
    });

    const iframeDocument = iframe.contentDocument;
    const page = iframeDocument?.querySelector(".page") as HTMLElement | null;

    if (!page) {
      throw new Error("No se encontro la plantilla del presupuesto.");
    }

    if (iframeDocument?.fonts?.ready) {
      await iframeDocument.fonts.ready;
    }

    await Promise.all(
      Array.from(iframeDocument?.images ?? []).map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }),
    );

    const canvas = await html2canvas(page, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: 2,
      useCORS: true,
      windowHeight: page.scrollHeight,
      windowWidth: page.scrollWidth,
    });
    const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const imageData = canvas.toDataURL("image/png");

    if (imageHeight <= pageHeight) {
      pdf.addImage(imageData, "PNG", 0, 0, imageWidth, imageHeight);
    } else {
      let remainingHeight = imageHeight;
      let position = 0;

      while (remainingHeight > 0) {
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
        remainingHeight -= pageHeight;
        position -= pageHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(`${quote.number}-${sanitizeFileName(quote.title || "presupuesto")}.pdf`);
  } finally {
    iframe.remove();
  }
}

async function imageToDataUrl(path: string) {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const response = await fetch(path);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function buildQuoteTemplateHtml(quote: Quote, logoDataUrl: string, watermarkDataUrl: string) {
  const materialRows = quote.items?.length
    ? quote.items
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.description)}</td>
              <td>${escapeHtml(`${item.quantity} ${item.unit}`)}</td>
              <td>${escapeHtml(formatPrice(item.unitPrice, quote.currency))}</td>
              <td>${escapeHtml(formatPrice(item.subtotal ?? (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), quote.currency))}</td>
            </tr>`,
        )
        .join("")
    : `<tr><td colspan="4">Sin materiales cargados.</td></tr>`;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(`Presupuesto ${quote.number}`)}</title>
  <style>
    @page { size: A4; margin: 8mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; color: #101827; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
    .page { position: relative; min-height: 281mm; border: 1px solid #dbe7ef; padding: 0; overflow: hidden; }
    .watermark { position: fixed; inset: 50% auto auto 50%; width: 150mm; max-height: 210mm; object-fit: contain; opacity: .08; transform: translate(-50%, -50%); z-index: 0; }
    .content { position: relative; z-index: 1; display: grid; gap: 4mm; padding: 0 0 4mm; }
    header { display: grid; grid-template-columns: 42mm 1fr 42mm; align-items: center; min-height: 27mm; padding: 4mm 0; border-bottom: 1px solid #94a3b8; }
    .brand { display: flex; align-items: center; gap: 2mm; padding-left: 0; }
    .brand img { width: 14mm; height: 14mm; object-fit: contain; }
    .brand strong, .brand span { display: block; }
    .brand strong { font-size: 11px; line-height: 1.1; }
    .brand span { color: #334155; font-size: 7.5px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
    h1 { margin: 0; text-align: center; color: #334155; font-size: 30px; letter-spacing: .03em; text-transform: uppercase; }
    section { margin: 0 3.2mm; padding: 3.2mm; border: 1px solid rgba(71,85,105,.22); border-radius: 5px; background: rgba(255,255,255,.36); break-inside: avoid; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 18mm; }
    dl { margin: 0; }
    dt { color: #334155; font-size: 10px; font-weight: 900; text-transform: uppercase; }
    dd { margin: 1mm 0 2mm; font-size: 11px; }
    h2 { margin: 0 0 3mm; font-size: 14px; }
    table { width: 100%; border-collapse: separate; border-spacing: 0 2mm; }
    td { padding: 3mm; background: rgba(15,23,42,.34); font-weight: 850; }
    td:first-child { border-radius: 5px 0 0 5px; }
    td:last-child { border-radius: 0 5px 5px 0; text-align: right; }
    td:nth-child(2), td:nth-child(3) { text-align: center; white-space: nowrap; }
    .total { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 20mm; }
    .highlight { margin-top: 1mm; padding: 2mm; background: rgba(45,212,191,.14); }
    .highlight dd { font-size: 22px; }
  </style>
</head>
<body>
  <main class="page">
    ${watermarkDataUrl ? `<img class="watermark" src="${watermarkDataUrl}" alt="" />` : ""}
    <div class="content">
      <header>
        <div class="brand">
          ${logoDataUrl ? `<img src="${logoDataUrl}" alt="" />` : ""}
          <div><strong>Security Solutions</strong><span>Presupuesto comercial</span></div>
        </div>
        <h1>Presupuesto</h1>
        <div></div>
      </header>

      <section>
        <dl class="grid">
          <div><dt>Cliente</dt><dd>${escapeHtml(quote.customer.name)}</dd></div>
          <div><dt>Servicio</dt><dd>${escapeHtml(deviceTypeLabels[quote.service])}</dd></div>
          <div><dt>Estado</dt><dd>${escapeHtml(quoteStatusLabels[quote.status])}</dd></div>
          <div><dt>Moneda</dt><dd>${escapeHtml(quote.currency)}</dd></div>
          <div><dt>Emision</dt><dd>${escapeHtml(formatDateTime(quote.issueDate))}</dd></div>
          <div><dt>Vencimiento</dt><dd>${escapeHtml(quote.validUntil ? formatDateTime(quote.validUntil) : "Sin fecha")}</dd></div>
          <div><dt>IVA</dt><dd>${escapeHtml(quote.taxIncluded ? "Aplicado" : "Sin IVA")}</dd></div>
          <div><dt>Margen</dt><dd>${escapeHtml(`${toMoneyNumber(quote.estimatedMargin).toFixed(2)}%`)}</dd></div>
        </dl>
      </section>

      <section><h2>Materiales</h2><table>${materialRows}</table></section>
      <section>
        <h2>Condiciones</h2>
        <dl class="grid">
          <div><dt>Tiempo de ejecucion</dt><dd>${escapeHtml(formatQuoteTerm(quote.executionTime, "dia"))}</dd></div>
          <div><dt>Garantia</dt><dd>${escapeHtml(formatQuoteTerm(quote.warranty, "mes"))}</dd></div>
          <div><dt>Forma de pago</dt><dd>${escapeHtml(quote.paymentTerms || "Sin definir")}</dd></div>
          <div><dt>Condiciones comerciales</dt><dd>${escapeHtml(quote.commercialTerms || "Sin condiciones")}</dd></div>
        </dl>
      </section>
      <section>
        <h2>Totales</h2>
        <dl class="total">
          <div><dt>Materiales</dt><dd>${escapeHtml(formatPrice(quote.materialsSubtotal, quote.currency))}</dd></div>
          <div><dt>Mano de obra</dt><dd>${escapeHtml(formatPrice(quote.laborSubtotal, quote.currency))}</dd></div>
          <div><dt>Gastos</dt><dd>${escapeHtml(formatPrice(quote.expensesSubtotal, quote.currency))}</dd></div>
          <div><dt>Subtotal</dt><dd>${escapeHtml(formatPrice(quote.subtotal, quote.currency))}</dd></div>
          <div><dt>Descuento</dt><dd>${escapeHtml(formatPrice(quote.discountAmount, quote.currency))}</dd></div>
          <div><dt>IVA</dt><dd>${escapeHtml(formatPrice(quote.tax, quote.currency))}</dd></div>
          <div class="highlight"><dt>Total</dt><dd>${escapeHtml(formatPrice(quote.total, quote.currency))}</dd></div>
          <div><dt>Ganancia estimada</dt><dd>${escapeHtml(formatPrice(quote.estimatedProfit, quote.currency))}</dd></div>
        </dl>
      </section>
    </div>
  </main>
</body>
</html>`;
}

function base64EncodeUnicode(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").slice(0, 80);
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatWorkOrderNumber(workOrder: Pick<WorkOrder, "id" | "createdAt">) {
  const source = `${workOrder.createdAt}-${workOrder.id}`;
  const hash = Array.from(source).reduce((total, char) => total + char.charCodeAt(0), 0);
  const number = (hash % 9999) + 1;
  return `OT-${String(number).padStart(4, "0")}`;
}

function buildCustomerShareText(customer: Customer) {
  return [
    `Hola ${customer.name},`,
    "",
    "Te contactamos desde Security Solutions.",
    "",
    "Quedamos a las ordenes.",
    "Security Solutions",
  ].join("\n");
}

function buildCustomerDocumentShareText(customer: Customer, document: CustomerDocument) {
  return [
    `Hola ${customer.name},`,
    "",
    `Te enviamos el documento: ${document.name}.`,
    document.createdAt ? `Fecha de carga: ${formatDateTime(document.createdAt)}.` : "",
    "",
    "Quedamos a las ordenes.",
    "Security Solutions",
  ].filter(Boolean).join("\n");
}

function inventorySortValue(item: InventoryItem, key: InventorySortKey) {
  const latestMovement = item.movements[0];
  const device = latestMovement?.installedDevice;

  if (key === "reference") {
    return Number(item.reference.replace(/\D/g, "")) || 0;
  }

  if (key === "date") {
    return new Date(latestMovement?.createdAt ?? item.updatedAt ?? item.createdAt).getTime();
  }

  if (key === "brand") {
    return device?.brand ?? item.supplier ?? "";
  }

  if (key === "model") {
    return device?.model ?? item.name;
  }

  if (key === "installed") {
    return item.installedQuantity ?? 0;
  }

  if (key === "status") {
    return !item.managedStock ? "Catalogo" : item.stock > 0 ? "Disponible" : "Sin stock";
  }

  return "";
}

function formatMailDate(value?: string) {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
