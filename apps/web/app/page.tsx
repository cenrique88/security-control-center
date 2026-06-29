"use client";

import {
  Bell,
  CalendarDays,
  Car,
  ClipboardList,
  DollarSign,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Plus,
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
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  AuthUser,
  Customer,
  CustomerPayload,
  CustomerSite,
  CustomerStatus,
  DashboardSummary,
  DevicePayload,
  DeviceType,
  GmailSync,
  GmailStatus,
  InventoryItem,
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

const emptyCustomerForm: CustomerPayload = {
  name: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
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
  checks: [],
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
  checks: [],
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

  const summaryCards = useMemo(
    () => [
      { label: "Clientes", value: summary.totalCustomers ?? summary.activeCustomers },
      { label: "Clientes activos", value: summary.activeCustomers },
      { label: "Trabajos programados", value: summary.scheduledJobs },
      { label: "Equipos instalados", value: summary.installedDevices },
      { label: "Cobros pendientes", value: summary.pendingPayments },
      { label: "Stock bajo", value: summary.inventory?.lowStock ?? 0 },
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
        title: "Stock bajo",
        detail: `${summary.inventory?.outOfStock ?? 0} articulos sin stock.`,
        module: "Almacen",
        severity: "warning",
        value: summary.inventory?.lowStock ?? 0,
      },
      Boolean(summary.inventory?.lowStock),
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

  const inventoryStats = useMemo(
    () => [
      { label: "Articulos", value: inventoryItems.length },
      { label: "Stock bajo", value: inventoryItems.filter((item) => item.stock <= item.minStock).length },
      { label: "Sin stock", value: inventoryItems.filter((item) => item.stock === 0).length },
      { label: "Movimientos", value: inventoryItems.reduce((sum, item) => sum + item.movements.length, 0) },
    ],
    [inventoryItems],
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
    const storedToken = localStorage.getItem("sscc_token");
    const storedUser = localStorage.getItem("sscc_user");

    if (!storedToken || !storedUser) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser) as AuthUser);
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
    if (!token || activeModule !== "Dashboard") {
      return;
    }

    void loadSummary(token);
    const interval = window.setInterval(() => {
      void loadSummary(token, true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [activeModule, token]);

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

  async function loadInventory(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setInventoryLoading(true);
    setInventoryError("");
    try {
      const params = new URLSearchParams();
      if (inventorySearch.trim()) {
        params.set("search", inventorySearch.trim());
      }
      if (inventoryCategory !== "ALL") {
        params.set("category", inventoryCategory);
      }
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
    } catch {
      setInventoryError("No se pudo cargar el almacen");
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
    } catch {
      setGmailStatus(fallbackGmailStatus);
      setGmailError("No se pudo consultar el estado de Gmail");
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
      }));
    } catch {
      setGmailError("No se pudieron sincronizar los datos de Gmail");
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
    } catch {
      setWhatsAppStatus(fallbackWhatsAppStatus);
      setWhatsAppError("No se pudo consultar el estado de WhatsApp");
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
      }));
    } catch {
      setWhatsAppError("No se pudieron sincronizar los datos de WhatsApp");
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
      await apiRequest<WorkOrder>("/api/work-orders", {
        token,
        method: "POST",
        body: JSON.stringify(cleanWorkOrderPayload({ ...workOrderForm, customerId })),
      });
      setWorkOrderForm({ ...emptyWorkOrderForm, customerId: selectedCustomerId ?? "" });
      await Promise.all([loadWorkOrders(token), loadAgenda(token), loadCustomers(token), loadSummary(token)]);
    } catch {
      setWorkOrderError("No se pudo guardar el trabajo");
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
      await apiRequest<InventoryItem>("/api/inventory", {
        token,
        method: "POST",
        body: JSON.stringify(cleanInventoryPayload(inventoryForm)),
      });
      setInventoryForm(emptyInventoryForm);
      await Promise.all([loadInventory(token), loadSummary(token)]);
    } catch {
      setInventoryError("No se pudo guardar el articulo");
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
    } catch {
      setInventoryError("No se pudo registrar el movimiento");
    } finally {
      setInventoryLoading(false);
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
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      legalName: customer.legalName ?? "",
      taxId: customer.taxId ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
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
    localStorage.removeItem("sscc_token");
    localStorage.removeItem("sscc_user");
    router.replace("/login");
  }

  if (!user) {
    return <main className="loadingScreen">Preparando SSCC...</main>;
  }

  return (
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
        </header>

        <section className="operatorStrip" aria-label="Usuario activo">
          <div>
            <span>Operador</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Rol</span>
            <strong>{user.role}</strong>
          </div>
        </section>

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
            onEditCustomer={editCustomer}
            onFormChange={setCustomerForm}
            onLocate={captureCustomerLocation}
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
            customers={customers}
            loading={workOrdersLoading}
            selectedCustomerId={selectedCustomerId}
            sites={sites}
            workOrderError={workOrderError}
            workOrderForm={workOrderForm}
            workOrderStats={workOrderStats}
            workOrders={workOrders}
            workSearch={workSearch}
            workStatus={workStatus}
            onFormChange={setWorkOrderForm}
            onRefresh={() => loadWorkOrders()}
            onSave={saveWorkOrder}
            onSearchChange={setWorkSearch}
            onSelectCustomer={selectCustomer}
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
            inventoryCategory={inventoryCategory}
            inventoryError={inventoryError}
            inventoryForm={inventoryForm}
            inventoryItems={inventoryItems}
            inventoryMovementForm={inventoryMovementForm}
            inventorySearch={inventorySearch}
            inventoryStats={inventoryStats}
            inventoryStockFilter={inventoryStockFilter}
            loading={inventoryLoading}
            workOrders={workOrders}
            onFormChange={setInventoryForm}
            onMovementFormChange={setInventoryMovementForm}
            onMovementSave={saveInventoryMovement}
            onRefresh={() => loadInventory()}
            onSave={saveInventoryItem}
            onSearchChange={setInventorySearch}
            onCategoryChange={setInventoryCategory}
            onStockFilterChange={setInventoryStockFilter}
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
            onRefresh={() => loadDevices()}
            onSave={saveDevice}
            onSearchChange={setDeviceSearch}
            onSelectCustomer={selectCustomer}
            onTypeChange={setDeviceType}
          />
        )}
      </section>
    </main>
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
  summaryCards: Array<{ label: string; value: number | string }>;
  onRefresh: () => void;
}) {
  return (
    <>
      <section className="summaryGrid" aria-label="Indicadores principales">
        {summaryCards.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
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

function CustomersView({
  customers,
  customerError,
  customerForm,
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
  onEditCustomer,
  onFormChange,
  onLocate,
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
  onEditCustomer: (customer: Customer) => void;
  onFormChange: (form: CustomerPayload) => void;
  onLocate: () => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onSiteFormChange: (form: SitePayload) => void;
  onSiteRefresh: () => void;
  onSiteSave: (event: FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: CustomerStatus | "ALL") => void;
}) {
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
                placeholder="Buscar por nombre, RUT, email o telefono"
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
                  <th>Estado</th>
                  <th>Sitios</th>
                  <th>Trabajos</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={customer.id === selectedCustomerId ? "selectedRow" : ""}
                    onClick={() => onSelectCustomer(customer.id)}
                  >
                    <td data-label="Cliente">
                      <strong>{customer.name}</strong>
                      <span>{customer.legalName || customer.taxId || "Sin razon social"}</span>
                    </td>
                    <td data-label="Contacto">
                      <strong>{customer.phone || "Sin telefono"}</strong>
                      <span>{customer.email || customer.address || "Sin contacto"}</span>
                    </td>
                    <td data-label="Estado">
                      <span className={`statusPill ${customer.status.toLowerCase()}`}>
                        {statusLabels[customer.status]}
                      </span>
                    </td>
                    <td data-label="Sitios">{customer._count.sites}</td>
                    <td data-label="Trabajos">{customer._count.workOrders}</td>
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

          <form className="siteForm" onSubmit={onSiteSave}>
            <label>
              Nombre del sitio
              <input
                value={siteForm.name}
                onChange={(event) => onSiteFormChange({ ...siteForm, name: event.target.value })}
                placeholder="Casa central, deposito, sucursal Pocitos"
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
            <label className="wideField">
              Notas
              <textarea
                value={siteForm.notes}
                onChange={(event) => onSiteFormChange({ ...siteForm, notes: event.target.value })}
                placeholder="Accesos, horarios, referente en sitio"
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
        </section>
      </div>
    </section>
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
  customers,
  loading,
  selectedCustomerId,
  sites,
  workOrderError,
  workOrderForm,
  workOrderStats,
  workOrders,
  workSearch,
  workStatus,
  onFormChange,
  onRefresh,
  onSave,
  onSearchChange,
  onSelectCustomer,
  onStatusChange,
  onUpdateStatus,
}: {
  customers: Customer[];
  loading: boolean;
  selectedCustomerId: string | null;
  sites: CustomerSite[];
  workOrderError: string;
  workOrderForm: WorkOrderPayload;
  workOrderStats: Array<{ label: string; value: number }>;
  workOrders: WorkOrder[];
  workSearch: string;
  workStatus: WorkOrderStatus | "ALL";
  onFormChange: (form: WorkOrderPayload) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onStatusChange: (value: WorkOrderStatus | "ALL") => void;
  onUpdateStatus: (id: string, status: WorkOrderStatus) => void;
}) {
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
              <p>Orden operativa</p>
              <h2>Nuevo trabajo</h2>
            </div>
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
            <Plus size={18} />
            Crear trabajo
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

          <div className="workOrderGrid">
            {workOrders.map((workOrder) => (
              <article key={workOrder.id} className="workOrderCard">
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
              </article>
            ))}
            {!workOrders.length ? <p className="emptyPanel">No hay trabajos para los filtros actuales.</p> : null}
          </div>
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
  inventoryCategory,
  inventoryError,
  inventoryForm,
  inventoryItems,
  inventoryMovementForm,
  inventorySearch,
  inventoryStats,
  inventoryStockFilter,
  loading,
  workOrders,
  onCategoryChange,
  onFormChange,
  onMovementFormChange,
  onMovementSave,
  onRefresh,
  onSave,
  onSearchChange,
  onStockFilterChange,
}: {
  devices: InstalledDevice[];
  inventoryCategory: DeviceType | "ALL";
  inventoryError: string;
  inventoryForm: InventoryItemPayload;
  inventoryItems: InventoryItem[];
  inventoryMovementForm: InventoryMovementPayload;
  inventorySearch: string;
  inventoryStats: Array<{ label: string; value: number | string }>;
  inventoryStockFilter: "ALL" | "LOW";
  loading: boolean;
  workOrders: WorkOrder[];
  onCategoryChange: (value: DeviceType | "ALL") => void;
  onFormChange: (form: InventoryItemPayload) => void;
  onMovementFormChange: (form: InventoryMovementPayload) => void;
  onMovementSave: (event: FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onStockFilterChange: (value: "ALL" | "LOW") => void;
}) {
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
                <p>Alta de stock</p>
                <h2>Nuevo articulo</h2>
              </div>
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
                <input
                  value={inventoryForm.name}
                  onChange={(event) => onFormChange({ ...inventoryForm, name: event.target.value })}
                  placeholder="Camara IP, bateria, DVR, cable UTP"
                />
              </label>
              <label>
                Stock inicial
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.stock}
                  onChange={(event) => onFormChange({ ...inventoryForm, stock: Number(event.target.value) })}
                />
              </label>
              <label>
                Minimo
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.minStock}
                  onChange={(event) => onFormChange({ ...inventoryForm, minStock: Number(event.target.value) })}
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
              Guardar articulo
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
                <select
                  value={inventoryMovementForm.itemId}
                  onChange={(event) => onMovementFormChange({ ...inventoryMovementForm, itemId: event.target.value })}
                >
                  <option value="">Seleccionar articulo</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.stock} {item.unit})
                    </option>
                  ))}
                </select>
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
            <select value={inventoryStockFilter} onChange={(event) => onStockFilterChange(event.target.value as "ALL" | "LOW")}>
              <option value="ALL">Todo stock</option>
              <option value="LOW">Stock bajo</option>
            </select>
            <button type="button" onClick={onRefresh}>
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Filtrar
            </button>
          </div>
          {inventoryError ? <p className="formError">{inventoryError}</p> : null}
          <div className="workOrderGrid">
            {inventoryItems.map((item) => (
              <article key={item.id} className="workOrderCard">
                <div className="workOrderCardHeader">
                  <span className={`statusPill ${item.stock <= item.minStock ? "waiting_customer" : "completed"}`}>
                    {item.stock <= item.minStock ? "Stock bajo" : "Disponible"}
                  </span>
                  <strong>{item.name}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Stock</dt>
                    <dd>
                      {item.stock} {item.unit}
                    </dd>
                  </div>
                  <div>
                    <dt>Minimo</dt>
                    <dd>{item.minStock}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>{item.category ? deviceTypeLabels[item.category] : "Sin categoria"}</dd>
                  </div>
                  <div>
                    <dt>Ubicacion</dt>
                    <dd>{item.location || "Sin ubicacion"}</dd>
                  </div>
                </dl>
                <p>{item.sku || item.supplier || item.notes || "Sin datos adicionales"}</p>
                <div className="movementList">
                  {item.movements.map((movement) => (
                    <span key={movement.id}>
                      {movement.type} {movement.quantity} - stock {movement.stockAfter}
                    </span>
                  ))}
                </div>
              </article>
            ))}
            {!inventoryItems.length ? <p className="emptyPanel">No hay articulos para los filtros actuales.</p> : null}
          </div>
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
}: {
  loading: boolean;
  status: WhatsAppStatus;
  sync: WhatsAppSync;
  whatsAppError: string;
  whatsAppStats: Array<{ label: string; value: number | string }>;
  onRefresh: () => void;
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
  onRefresh: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onTypeChange: (value: DeviceType | "ALL") => void;
}) {
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
            {devices.map((device) => (
              <article key={device.id} className="deviceCard">
                <div className="deviceCardHeader">
                  <span className="statusPill prospect">{deviceTypeLabels[device.type]}</span>
                  <strong>{[device.brand, device.model].filter(Boolean).join(" ") || "Equipo sin marca"}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{device.site.customer.name}</dd>
                  </div>
                  <div>
                    <dt>Sitio</dt>
                    <dd>{device.site.name}</dd>
                  </div>
                  <div>
                    <dt>Serie</dt>
                    <dd>{device.serial || "Sin serie"}</dd>
                  </div>
                  <div>
                    <dt>IP / ID</dt>
                    <dd>{device.ipAddress || "Sin dato"}</dd>
                  </div>
                </dl>
                <p>{device.notes || device.site.address}</p>
              </article>
            ))}
            {!devices.length ? <p className="emptyPanel">No hay equipos para los filtros actuales.</p> : null}
          </div>
        </section>
      </div>
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
    minStock: Number(form.minStock) || 0,
    location: form.location?.trim() || undefined,
    supplier: form.supplier?.trim() || undefined,
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
