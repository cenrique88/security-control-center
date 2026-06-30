"use client";

import {
  Bell,
  CalendarDays,
  Car,
  ClipboardList,
  Copy,
  DollarSign,
  Edit3,
  FileText,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Package,
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
  Payment,
  PaymentPayload,
  Quote,
  QuotePayload,
  SitePayload,
  Vehicle,
  VehiclePayload,
  WhatsAppChat,
  WhatsAppSync,
  WhatsAppStatus,
  WorkOrder,
  WorkOrderPayload,
  WorkOrderStatus,
} from "./lib/api";

const modules = [
  { name: "Dashboard", icon: ShieldCheck },
  { name: "Clientes", icon: Users },
  { name: "Trabajos", icon: Wrench },
  { name: "Agenda", icon: CalendarDays },
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
  GPS: "GPS",
  NETWORKING: "Redes",
  MAINTENANCE: "Mantenimiento",
  OTHER: "Otro",
};

const workStatusLabels: Record<WorkOrderStatus, string> = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En curso",
  WAITING_CUSTOMER: "Espera cliente",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
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
  customerId?: string;
  workOrderId?: string;
};

type InventorySortKey = "reference" | "date" | "brand" | "model" | "installed" | "status";
type InventoryColumnKey = InventorySortKey | "actions";

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
  logoUrl: "",
  status: "PROSPECT",
  notes: "",
};

const emptySiteForm: SitePayload = {
  name: "",
  address: "",
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
};

const emptyQuoteForm: QuotePayload = {
  customerId: "",
  number: "",
  title: "",
  laborPoints: 0,
  subtotal: 0,
  tax: 0,
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
  const [agendaOrders, setAgendaOrders] = useState<WorkOrder[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryCatalogMatches, setInventoryCatalogMatches] = useState<InventoryItem[]>([]);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>(fallbackGmailStatus);
  const [gmailSync, setGmailSync] = useState<GmailSync>(emptyGmailSync);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus>(fallbackWhatsAppStatus);
  const [whatsAppSync, setWhatsAppSync] = useState<WhatsAppSync>(emptyWhatsAppSync);
  const [customerForm, setCustomerForm] = useState<CustomerPayload>(emptyCustomerForm);
  const [siteForm, setSiteForm] = useState<SitePayload>(emptySiteForm);
  const [deviceForm, setDeviceForm] = useState<DevicePayload>(emptyDeviceForm);
  const [workOrderForm, setWorkOrderForm] = useState<WorkOrderPayload>(emptyWorkOrderForm);
  const [quoteForm, setQuoteForm] = useState<QuotePayload>(emptyQuoteForm);
  const [paymentForm, setPaymentForm] = useState<PaymentPayload>(emptyPaymentForm);
  const [vehicleForm, setVehicleForm] = useState<VehiclePayload>(emptyVehicleForm);
  const [inventoryForm, setInventoryForm] = useState<InventoryItemPayload>(emptyInventoryForm);
  const [inventoryMovementForm, setInventoryMovementForm] =
    useState<InventoryMovementPayload>(emptyInventoryMovementForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingWorkOrderId, setEditingWorkOrderId] = useState<string | null>(null);
  const [editingInventoryItemId, setEditingInventoryItemId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType | "ALL">("ALL");
  const [workSearch, setWorkSearch] = useState("");
  const [workStatus, setWorkStatus] = useState<WorkOrderStatus | "ALL">("ALL");
  const [agendaDate, setAgendaDate] = useState(() => toDateInputValue(new Date()));
  const [agendaStatus, setAgendaStatus] = useState<WorkOrderStatus | "ALL">("ALL");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<"ALL" | "PENDING" | "ACCEPTED">("ALL");
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
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [siteError, setSiteError] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [workOrderError, setWorkOrderError] = useState("");
  const [agendaError, setAgendaError] = useState("");
  const [quoteError, setQuoteError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [gmailError, setGmailError] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [locating, setLocating] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workOrderDocument, setWorkOrderDocument] = useState<WorkOrder | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [customerProfileLoading, setCustomerProfileLoading] = useState(false);
  const [customerProfileError, setCustomerProfileError] = useState("");
  const [focusedWorkOrderId, setFocusedWorkOrderId] = useState<string | null>(null);
  const [messageCompose, setMessageCompose] = useState<MessageComposeState | null>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState("");

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

  const customerStats = useMemo(
    () => [
      { label: "Total", value: customers.length },
      { label: "Activos", value: customers.filter((customer) => customer.status === "ACTIVE").length },
      { label: "Prospectos", value: customers.filter((customer) => customer.status === "PROSPECT").length },
      { label: "Inactivos", value: customers.filter((customer) => customer.status === "INACTIVE").length },
    ],
    [customers],
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
      { label: "Trabajos", value: workOrders.length },
      { label: "Programados", value: workOrders.filter((workOrder) => workOrder.status === "SCHEDULED").length },
      { label: "En curso", value: workOrders.filter((workOrder) => workOrder.status === "IN_PROGRESS").length },
      { label: "Completados", value: workOrders.filter((workOrder) => workOrder.status === "COMPLETED").length },
    ],
    [workOrders],
  );

  const selectedAgendaDate = useMemo(() => parseDateInput(agendaDate), [agendaDate]);

  const agendaItems = useMemo(
    () =>
      agendaOrders
        .filter((workOrder) => workOrder.scheduledAt)
        .sort((a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime()),
    [agendaOrders],
  );

  const agendaToday = useMemo(
    () => agendaItems.filter((workOrder) => isSameDay(workOrder.scheduledAt, selectedAgendaDate)),
    [agendaItems, selectedAgendaDate],
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

  const agendaStats = useMemo(
    () => [
      { label: "Hoy", value: agendaToday.length },
      { label: "Atrasados", value: agendaOverdue.length },
      { label: "Semana", value: agendaWeek.length },
      { label: "Sin fecha", value: agendaOrders.filter((workOrder) => !workOrder.scheduledAt).length },
    ],
    [agendaOrders, agendaOverdue, agendaToday, agendaWeek],
  );

  const quoteStats = useMemo(
    () => [
      { label: "Presupuestos", value: quotes.length },
      { label: "Pendientes", value: quotes.filter((quote) => !quote.acceptedAt).length },
      { label: "Aceptados", value: quotes.filter((quote) => quote.acceptedAt).length },
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
      const storedToken = localStorage.getItem("sscc_token");
      const storedUser = localStorage.getItem("sscc_user");

      if (!storedToken || !storedUser || isExpiredJwt(storedToken)) {
        redirectToLogin();
        return;
      }

      setToken(storedToken);
      setUser(JSON.parse(storedUser) as AuthUser);
      setAuthChecked(true);
    } catch {
      redirectToLogin();
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
    void loadQuotes(token);
    void loadPayments(token);
    void loadInventory(token);
    void loadVehicles(token);
    void loadGmailStatus(token);
    void syncGmail(token, true);
    void loadWhatsAppStatus(token);
    void syncWhatsApp(token);
  }, [token]);

  useEffect(() => {
    if (!token || activeModule !== "Gmail") {
      return;
    }

    void syncGmail(token, true);
    const interval = window.setInterval(() => {
      void syncGmail(token, true);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [activeModule, token]);

  useEffect(() => {
    if (!token || activeModule !== "WhatsApp") {
      return;
    }

    void syncWhatsApp(token, true);
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

    void loadSummary(token);
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

  async function loadWorkOrders(activeToken = token, customerId = selectedCustomerId) {
    if (!activeToken) {
      return;
    }

    setWorkOrdersLoading(true);
    setWorkOrderError("");
    try {
      const params = new URLSearchParams();
      if (workSearch.trim()) {
        params.set("search", workSearch.trim());
      }
      if (customerId) {
        params.set("customerId", customerId);
      }
      if (workStatus !== "ALL") {
        params.set("status", workStatus);
      }

      const query = params.toString();
      const data = await apiRequest<WorkOrder[]>(`/api/work-orders${query ? `?${query}` : ""}`, {
        token: activeToken,
      });
      setWorkOrders(data);
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

  async function loadQuotes(activeToken = token, customerId = selectedCustomerId) {
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

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !customerForm.name.trim()) {
      setCustomerError("El nombre del cliente es obligatorio");
      return;
    }

    const payload = cleanCustomerPayload(customerForm);
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
      setCustomerForm(emptyCustomerForm);
      setEditingCustomerId(null);
      await Promise.all([loadCustomers(token), loadSummary(token)]);
    } catch {
      setCustomerError("No se pudo guardar el cliente");
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

    const customerId = quoteForm.customerId || selectedCustomerId || "";
    if (!customerId || !quoteForm.title.trim()) {
      setQuoteError("Selecciona un cliente y escribe el titulo del presupuesto");
      return;
    }

    setQuotesLoading(true);
    setQuoteError("");
    try {
      await apiRequest<Quote>("/api/quotes", {
        token,
        method: "POST",
        body: JSON.stringify(cleanQuotePayload({ ...quoteForm, customerId })),
      });
      setQuoteForm({ ...emptyQuoteForm, customerId: selectedCustomerId ?? "" });
      await Promise.all([loadQuotes(token), loadCustomers(token), loadSummary(token)]);
    } catch {
      setQuoteError("No se pudo guardar el presupuesto");
    } finally {
      setQuotesLoading(false);
    }
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

  async function acceptQuote(id: string) {
    if (!token) {
      return;
    }

    setQuotesLoading(true);
    setQuoteError("");
    try {
      await apiRequest<Quote>(`/api/quotes/${id}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ acceptedAt: new Date().toISOString() }),
      });
      await Promise.all([loadQuotes(token), loadCustomers(token)]);
    } catch {
      setQuoteError("No se pudo aceptar el presupuesto");
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
    setActiveModule("Clientes");
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      legalName: customer.legalName ?? "",
      taxId: customer.taxId ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      logoUrl: customer.logoUrl ?? "",
      status: customer.status,
      notes: customer.notes ?? "",
    });
  }

  function selectCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    setWorkOrderForm((currentForm) => ({ ...currentForm, customerId, siteId: "" }));
    setQuoteForm((currentForm) => ({ ...currentForm, customerId }));
    setPaymentForm((currentForm) => ({ ...currentForm, customerId }));
    void loadSites(customerId);
    void loadDevices(token, customerId);
    void loadWorkOrders(token, customerId);
    void loadQuotes(token, customerId);
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

  function cancelCustomerEdit() {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
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
          }));
        } catch {
          setCustomerForm((currentForm) => ({
            ...currentForm,
            address: `GPS: ${latitude}, ${longitude}`,
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
    localStorage.removeItem("sscc_token");
    localStorage.removeItem("sscc_user");
    setAuthChecked(true);
    setAuthRedirecting(true);
    router.replace("/login");
  }

  function printWorkOrderDocument() {
    window.print();
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
    <main className="shell">
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
            const enabled =
              module.name === "Dashboard" ||
              module.name === "Clientes" ||
              module.name === "Trabajos" ||
              module.name === "Agenda" ||
              module.name === "Presupuestos" ||
              module.name === "Cobros" ||
              module.name === "Almacen" ||
              module.name === "Equipos" ||
              module.name === "Vehiculos" ||
              module.name === "Gmail" ||
              module.name === "WhatsApp";
            return (
              <button
                type="button"
                key={module.name}
                className={module.name === activeModule ? "active" : ""}
                onClick={() => enabled && setActiveModule(module.name)}
                disabled={!enabled}
                title={enabled ? module.name : "Modulo pendiente"}
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
          <div>
            <p>{activeModule === "Dashboard" ? "Centro de Monitoreo" : "Gestion operativa"}</p>
            <h1>
              {activeModule === "Dashboard" ? "Security Solutions Control Center" : activeModule}
            </h1>
            <span className="connectionStatus">{status}</span>
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
                    : activeModule === "Trabajos"
                      ? loadWorkOrders()
                      : activeModule === "Agenda"
                        ? loadAgenda()
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
              <div className="notificationsMenu">
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
            customers={customers}
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
            selectedCustomer={selectedCustomer}
            selectedCustomerId={selectedCustomerId}
            siteError={siteError}
            siteForm={siteForm}
            sites={sites}
            sitesLoading={sitesLoading}
            onCancelEdit={cancelCustomerEdit}
            onCloseProfile={() => {
              setCustomerProfile(null);
              setCustomerProfileError("");
            }}
            onEditCustomer={editCustomer}
            onFormChange={setCustomerForm}
            onLocate={captureCustomerLocation}
            onAddDocument={addCustomerDocument}
            onComposeMail={composeCustomerMail}
            onComposeWhatsApp={composeCustomerWhatsApp}
            onOpenProfile={openCustomerProfile}
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
            agendaOverdue={agendaOverdue}
            agendaStats={agendaStats}
            agendaStatus={agendaStatus}
            agendaToday={agendaToday}
            agendaWeek={agendaWeek}
            loading={agendaLoading}
            selectedDate={selectedAgendaDate}
            onDateChange={setAgendaDate}
            onRefresh={() => loadAgenda()}
            onStatusChange={setAgendaStatus}
            onUpdateStatus={updateWorkOrderStatus}
          />
        ) : activeModule === "Presupuestos" ? (
          <QuotesView
            customers={customers}
            loading={quotesLoading}
            quoteError={quoteError}
            quoteForm={quoteForm}
            quoteSearch={quoteSearch}
            quoteStats={quoteStats}
            quoteStatus={quoteStatus}
            quotes={quotes}
            selectedCustomerId={selectedCustomerId}
            onAccept={acceptQuote}
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
            loading={whatsAppLoading}
            status={whatsAppStatus}
            sync={whatsAppSync}
            whatsAppError={whatsAppError}
            whatsAppStats={whatsAppStats}
            onRefresh={() => syncWhatsApp()}
            onReply={composeWhatsAppChat}
          />
        ) : (
          <DevicesView
            customers={customers}
            deviceError={deviceError}
            deviceForm={deviceForm}
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
    {messageCompose && typeof document !== "undefined" ? createPortal(
      <MessageComposeModal
        compose={messageCompose}
        error={messageError}
        loading={messageSending}
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
  onChange,
  onClose,
  onSend,
}: {
  compose: MessageComposeState;
  error: string;
  loading: boolean;
  onChange: (compose: MessageComposeState) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  const channelLabel = compose.channel === "whatsapp" ? "WhatsApp" : "Mail";
  const destinationLabel = compose.channel === "whatsapp" ? "Telefono" : "Email";

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
            <p>Edita el mensaje antes de enviarlo desde el CRM.</p>
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
          <label>
            {destinationLabel}
            <input
              value={compose.to}
              onChange={(event) => onChange({ ...compose, to: event.target.value })}
              placeholder={compose.channel === "whatsapp" ? "099 000 000" : "cliente@empresa.com"}
            />
          </label>
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
  const documentNumber = workOrder.id.slice(0, 8).toUpperCase();

  return (
    <div className="documentOverlay">
      <div className="documentToolbar">
        <div>
          <strong>Orden de trabajo #{documentNumber}</strong>
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
          <div className="documentBrand">
            <img src="/security-solutions-logo.png" alt="Security Solutions" />
            <div>
              <strong>Security Solutions</strong>
              <span>Su seguridad es nuestra prioridad</span>
            </div>
          </div>
          <div className="documentNumberBox">
            <span>Orden de trabajo</span>
            <strong>#{documentNumber}</strong>
            <small>{formatDateTime(workOrder.completedAt ?? workOrder.updatedAt)}</small>
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

        <section className="documentSection">
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
            <p>{summary.lastUpdatedAt ? `Actualizado ${formatDateTime(summary.lastUpdatedAt)}` : "Inicio de jornada"}</p>
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
  onAddDocument,
  onComposeMail,
  onComposeWhatsApp,
  onOpenProfile,
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
  onAddDocument: (customerId: string, payload: CustomerDocumentPayload) => Promise<void>;
  onComposeMail: (customer: Customer) => void;
  onComposeWhatsApp: (customer: Customer) => void;
  onOpenProfile: (customer: Customer) => void;
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
      <div className="summaryGrid customerStats" aria-label="Resumen de clientes">
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
              <p>{editingCustomerId ? "Actualizar ficha" : "Nuevo cliente"}</p>
              <h2>{editingCustomerId ? "Editar cliente" : "Alta rapida"}</h2>
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
              Nombre comercial
              <input
                value={customerForm.name}
                onChange={(event) => onFormChange({ ...customerForm, name: event.target.value })}
                placeholder="Cliente o contacto principal"
              />
            </label>
            <label>
              Razon social
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
                onChange={(event) => onFormChange({ ...customerForm, address: event.target.value })}
                placeholder="Direccion principal"
              />
            </label>
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
                placeholder="Observaciones operativas, horarios, contactos, preferencias"
              />
            </label>
          </div>

          {customerError ? <p className="formError">{customerError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            {editingCustomerId ? <Save size={18} /> : <Plus size={18} />}
            {editingCustomerId ? "Guardar cambios" : "Crear cliente"}
          </button>
        </form>

        <section className="customerDirectory">
          <div className="directoryToolbar">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={customerSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar por referencia, nombre, RUT, email o telefono"
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
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th className="centerColumn">Estado</th>
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
                    <td data-label="Cliente">
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
                    <td colSpan={6} className="emptyTable">
                      No hay clientes para los filtros actuales.
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
              <p>Sitios del cliente</p>
              <h2>{selectedCustomer ? selectedCustomer.name : "Selecciona un cliente"}</h2>
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
                Direccion
                <input
                  value={siteForm.address}
                  onChange={(event) => onSiteFormChange({ ...siteForm, address: event.target.value })}
                  placeholder="Direccion de instalacion"
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
                  </div>
                </article>
              ))}
              {selectedCustomer && !sites.length ? (
                <p className="emptyPanel">Este cliente todavia no tiene sitios cargados.</p>
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
  onOpenWorkOrder: (workOrder: WorkOrder) => void;
}) {
  const customer = profile?.customer;
  const orderedWorkOrders = profile ? sortWorkOrdersByDate(profile.workOrders) : [];
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

  function openCustomerDocument(document: CustomerDocument) {
    const target = document.dataUrl || document.url;
    if (!target) {
      window.alert("Este documento no tiene archivo asociado.");
      return;
    }

    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="deviceDetailOverlay customerProfileOverlay" onClick={onClose}>
      <section className="customerProfileModal" aria-label="Ficha del cliente" onClick={(event) => event.stopPropagation()}>
        <header className="deviceDetailHeader">
          <div>
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
            ) : null}
            <div className="documentToolbarActions">
              {customer ? (
                <>
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
                  <dd>{profile.customer.address || "Sin direccion"}</dd>
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
                    <span>{site.address}</span>
                    <small>{site._count.equipment} equipos - {site._count.workOrders} trabajos</small>
                  </article>
                ))}
                {!profile.sites.length ? <p className="emptyPanel">Sin sitios cargados.</p> : null}
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
                            <span>{workOrder.site?.address ?? "Sin direccion"}</span>
                          </td>
                          <td data-label="Estado">
                            <span className={`statusPill ${workOrder.status.toLowerCase()}`}>
                              {workStatusLabels[workOrder.status]}
                            </span>
                          </td>
                          <td data-label="Equipos / Materiales">
                            <span>{materials.length ? materials.map((item) => `${item.name} x${item.quantity}`).join(" / ") : "Sin materiales"}</span>
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

            <section className="customerProfileSection">
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
                        <tr key={group.key}>
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

            <section className="customerProfileSection">
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
                  <button
                    key={document.id}
                    type="button"
                    className="customerProfileDocumentButton"
                    onClick={() => openCustomerDocument(document)}
                  >
                    <strong>{document.name}</strong>
                    <span>{document.mimeType || document.type || "Documento"}</span>
                    <small>{document.createdAt ? formatDateTime(document.createdAt) : "Sin fecha"}</small>
                  </button>
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
  onUpdateStatus,
}: {
  agendaDate: string;
  agendaError: string;
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
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
}) {
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startOfDay(selectedDate), index);
    const count = agendaWeek.filter((workOrder) => isSameDay(workOrder.scheduledAt, date)).length;
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
              <h2>Trabajos de hoy</h2>
            </div>
          </div>
          <AgendaWorkList workOrders={agendaToday} emptyText="No hay trabajos para esta fecha." onUpdateStatus={onUpdateStatus} />
        </section>

        <section className="agendaColumn">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Seguimiento</p>
              <h2>Atrasados</h2>
            </div>
          </div>
          <AgendaWorkList workOrders={agendaOverdue} emptyText="No hay trabajos atrasados." onUpdateStatus={onUpdateStatus} compact />
        </section>

        <section className="agendaColumn">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Proximos dias</p>
              <h2>Semana</h2>
            </div>
          </div>
          <AgendaWorkList workOrders={agendaWeek} emptyText="No hay trabajos en la semana." onUpdateStatus={onUpdateStatus} compact />
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
                      <button type="button" className="secondaryButton" onClick={() => onEditWorkOrder(selectedWorkOrder)}>
                        <Edit3 size={16} />
                        Editar
                      </button>
                      <button type="button" className="iconButton" onClick={() => setSelectedWorkOrderId(null)} aria-label="Cerrar orden">
                        <X size={18} />
                      </button>
                    </div>
                  </header>

                  <dl className="customerProfileGrid">
                    <div>
                      <dt>Cliente</dt>
                      <dd>{selectedWorkOrder.customer.name}</dd>
                    </div>
                    <div>
                      <dt>Sitio</dt>
                      <dd>{selectedWorkOrder.site?.name ?? "Sin sitio"}</dd>
                    </div>
                    <div>
                      <dt>Estado</dt>
                      <dd>{workStatusLabels[selectedWorkOrder.status]}</dd>
                    </div>
                    <div>
                      <dt>Agenda</dt>
                      <dd>{formatDateTime(selectedWorkOrder.scheduledAt)}</dd>
                    </div>
                  </dl>

                  <p className="workOrderDetailNotes">{selectedWorkOrder.notes || selectedWorkOrder.site?.address || "Sin notas operativas"}</p>

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

function QuotesView({
  customers,
  loading,
  quoteError,
  quoteForm,
  quoteSearch,
  quoteStats,
  quoteStatus,
  quotes,
  selectedCustomerId,
  onAccept,
  onFormChange,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onStatusChange,
}: {
  customers: Customer[];
  loading: boolean;
  quoteError: string;
  quoteForm: QuotePayload;
  quoteSearch: string;
  quoteStats: Array<{ label: string; value: number | string }>;
  quoteStatus: "ALL" | "PENDING" | "ACCEPTED";
  quotes: Quote[];
  selectedCustomerId: string | null;
  onAccept: (id: string) => void;
  onFormChange: (form: QuotePayload) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onStatusChange: (value: "ALL" | "PENDING" | "ACCEPTED") => void;
}) {
  const subtotal = Number(quoteForm.subtotal) || 0;
  const tax = quoteForm.tax === undefined || Number.isNaN(Number(quoteForm.tax)) ? 0 : Number(quoteForm.tax);
  const total = subtotal + tax;

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
              <h2>Nuevo presupuesto</h2>
            </div>
          </div>

          <div className="formGrid">
            <label>
              Cliente
              <select
                value={quoteForm.customerId || selectedCustomerId || ""}
                onChange={(event) => {
                  onSelectCustomer(event.target.value);
                  onFormChange({ ...quoteForm, customerId: event.target.value });
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
              Puntos / horas
              <input
                type="number"
                min="0"
                value={quoteForm.laborPoints}
                onChange={(event) => onFormChange({ ...quoteForm, laborPoints: Number(event.target.value) })}
              />
            </label>
            <label>
              Subtotal
              <input
                type="number"
                min="0"
                step="0.01"
                value={quoteForm.subtotal}
                onChange={(event) => {
                  const nextSubtotal = Number(event.target.value);
                  onFormChange({
                    ...quoteForm,
                    subtotal: nextSubtotal,
                    tax: Math.round(nextSubtotal * 22) / 100,
                  });
                }}
              />
            </label>
            <label>
              IVA
              <input
                type="number"
                min="0"
                step="0.01"
                value={quoteForm.tax}
                onChange={(event) => onFormChange({ ...quoteForm, tax: Number(event.target.value) })}
              />
            </label>
            <div className="quoteTotalBox">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>

          {quoteError ? <p className="formError">{quoteError}</p> : null}

          <button type="submit" className="primaryButton" disabled={loading}>
            <Plus size={18} />
            Crear presupuesto
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
              onChange={(event) => onStatusChange(event.target.value as "ALL" | "PENDING" | "ACCEPTED")}
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="ACCEPTED">Aceptados</option>
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>

          <div className="quoteGrid">
            {quotes.map((quote) => (
              <article key={quote.id} className="quoteCard">
                <div className="quoteCardHeader">
                  <span className={`statusPill ${quote.acceptedAt ? "completed" : "scheduled"}`}>
                    {quote.acceptedAt ? "Aceptado" : "Pendiente"}
                  </span>
                  <strong>{quote.number}</strong>
                </div>
                <h3>{quote.title}</h3>
                <dl>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{quote.customer.name}</dd>
                  </div>
                  <div>
                    <dt>Puntos</dt>
                    <dd>{quote.laborPoints}</dd>
                  </div>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(quote.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatCurrency(quote.total)}</dd>
                  </div>
                </dl>
                <div className="quoteActions">
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => onAccept(quote.id)}
                    disabled={Boolean(quote.acceptedAt)}
                  >
                    <Save size={16} />
                    Aceptar
                  </button>
                </div>
              </article>
            ))}
            {!quotes.length ? <p className="emptyPanel">No hay presupuestos para los filtros actuales.</p> : null}
          </div>
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
  onToggleActive,
}: {
  loading: boolean;
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
  onToggleActive: (vehicle: Vehicle) => void;
}) {
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

          <div className="vehicleGrid">
            {vehicles.map((vehicle) => (
              <article key={vehicle.id} className="vehicleCard">
                <div className="vehicleCardHeader">
                  <span className={`statusPill ${vehicle.active ? "completed" : "inactive"}`}>
                    {vehicle.active ? "Activo" : "Inactivo"}
                  </span>
                  <strong>{vehicle.name}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Matricula</dt>
                    <dd>{vehicle.plate || "Sin matricula"}</dd>
                  </div>
                  <div>
                    <dt>Traccar</dt>
                    <dd>{vehicle.traccarDeviceId || "Sin vincular"}</dd>
                  </div>
                  <div>
                    <dt>Actualizado</dt>
                    <dd>{formatShortDate(vehicle.updatedAt)}</dd>
                  </div>
                </dl>
                <div className="vehicleActions">
                  <button type="button" className="secondaryButton" onClick={() => onToggleActive(vehicle)}>
                    {vehicle.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </article>
            ))}
            {!vehicles.length ? <p className="emptyPanel">No hay vehiculos para los filtros actuales.</p> : null}
          </div>
        </section>
      </div>
    </section>
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
  loading,
  status,
  sync,
  whatsAppError,
  whatsAppStats,
  onRefresh,
  onReply,
}: {
  loading: boolean;
  status: WhatsAppStatus;
  sync: WhatsAppSync;
  whatsAppError: string;
  whatsAppStats: Array<{ label: string; value: number | string }>;
  onRefresh: () => void;
  onReply: (chat: WhatsAppChat) => void;
}) {
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
              : "Falta configurar OpenWA, sesion o token de API."}
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

      <div className="integrationLayout">
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

        <section className="integrationPanel">
          <div className="sectionHeader compactHeader">
            <div>
              <p>Operacion</p>
              <h2>Chats recientes</h2>
            </div>
          </div>
          <div className="whatsAppChatList">
            {sync.chats.map((chat) => (
              <article key={chat.id} className={chat.unreadCount ? "unreadChat" : ""}>
                <div>
                  <strong>{chat.name || chat.id}</strong>
                  <span>{chat.isGroup ? "Grupo" : "Chat"} · {formatWhatsAppTime(chat.timestamp)}</span>
                </div>
                <p>{chat.lastMessage || "Sin ultimo mensaje disponible"}</p>
                <button type="button" className="secondaryButton" onClick={() => onReply(chat)}>
                  <MessageSquare size={16} />
                  Responder
                </button>
                {chat.unreadCount ? <em>{chat.unreadCount}</em> : null}
              </article>
            ))}
            {!sync.chats.length ? <p className="emptyPanel">Todavia no hay chats sincronizados.</p> : null}
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
  return {
    name: form.name.trim(),
    legalName: form.legalName?.trim() || undefined,
    taxId: form.taxId?.trim() || undefined,
    email: form.email?.trim() || undefined,
    phone: form.phone?.trim() || undefined,
    address: form.address?.trim() || undefined,
    logoUrl: form.logoUrl?.trim() || undefined,
    status: form.status,
    notes: form.notes?.trim() || undefined,
  };
}

function cleanSitePayload(form: SitePayload): SitePayload {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
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
  };
}

function cleanQuotePayload(form: QuotePayload): QuotePayload {
  return {
    customerId: form.customerId,
    number: form.number?.trim() || undefined,
    title: form.title.trim(),
    laborPoints: Number(form.laborPoints) || 0,
    subtotal: Number(form.subtotal) || 0,
    tax: form.tax === undefined ? undefined : Number(form.tax) || 0,
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
  const documentNumber = workOrder.id.slice(0, 8).toUpperCase();
  const site = workOrder.site ? `${workOrder.site.name} - ${workOrder.site.address}` : "Sin sitio especifico";
  const groupedMaterials = groupWorkOrderMaterials(workOrder.inventoryMovements ?? []);
  const materials = groupedMaterials.length
    ? groupedMaterials
        .map((movement) => `- ${movement.name} x${movement.quantity} ${movement.unit}`)
        .join("\n")
    : "- Sin materiales cargados";

  return [
    `Orden de trabajo #${documentNumber}`,
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
