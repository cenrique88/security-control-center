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
  InstalledDevice,
  SitePayload,
} from "./lib/api";

const modules = [
  { name: "Dashboard", icon: ShieldCheck },
  { name: "Clientes", icon: Users },
  { name: "Trabajos", icon: Wrench },
  { name: "Agenda", icon: CalendarDays },
  { name: "Presupuestos", icon: ClipboardList },
  { name: "Cobros", icon: DollarSign },
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

const fallbackSummary: DashboardSummary = {
  activeCustomers: 0,
  scheduledJobs: 0,
  pendingPayments: 0,
  installedDevices: 0,
  activeVehicles: 0,
  monitoringItems: [
    { label: "Trabajos programados", value: 0, detail: "Sin conexion al backend" },
    { label: "Correos importantes", value: 0, detail: "Gmail pendiente de conectar" },
    { label: "Mensajes de WhatsApp", value: 0, detail: "Evolution API pendiente" },
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
  const [customerForm, setCustomerForm] = useState<CustomerPayload>(emptyCustomerForm);
  const [siteForm, setSiteForm] = useState<SitePayload>(emptySiteForm);
  const [deviceForm, setDeviceForm] = useState<DevicePayload>(emptyDeviceForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType | "ALL">("ALL");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerStatus, setCustomerStatus] = useState<CustomerStatus | "ALL">("ALL");
  const [status, setStatus] = useState("Cargando datos...");
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [siteError, setSiteError] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [locating, setLocating] = useState(false);

  const summaryCards = useMemo(
    () => [
      { label: "Clientes activos", value: summary.activeCustomers },
      { label: "Trabajos programados", value: summary.scheduledJobs },
      { label: "Equipos instalados", value: summary.installedDevices },
      { label: "Cobros pendientes", value: summary.pendingPayments },
    ],
    [summary],
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
  }, [token]);

  async function loadSummary(activeToken = token) {
    if (!activeToken) {
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<DashboardSummary>("/api/dashboard/summary", {
        token: activeToken,
      });
      setSummary({
        ...data,
        monitoringItems: [
          ...data.monitoringItems,
          { label: "Correos importantes", value: 0, detail: "Gmail pendiente de conectar" },
          { label: "Mensajes de WhatsApp", value: 0, detail: "Evolution API pendiente" },
          { label: "Alertas tecnicas", value: 0, detail: "Pendiente de integraciones" },
        ],
      });
      setStatus("Datos conectados al backend");
    } catch {
      setSummary(fallbackSummary);
      setStatus("Backend o base de datos no disponible");
    } finally {
      setLoading(false);
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
    void loadSites(customerId);
    void loadDevices(token, customerId);
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
            const enabled = module.name === "Dashboard" || module.name === "Clientes" || module.name === "Equipos";
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
                  : activeModule === "Equipos"
                    ? loadDevices()
                    : loadSummary()
              }
            >
              <RefreshCw size={20} className={loading || customersLoading || devicesLoading ? "spin" : ""} />
            </button>
            <button type="button" title="Notificaciones" aria-label="Notificaciones">
              <Bell size={20} />
            </button>
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
  summaryCards: Array<{ label: string; value: number }>;
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
            <p>Inicio de jornada</p>
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
              <strong>{item.value}</strong>
              <p>{item.detail ?? "Dato conectado al sistema"}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
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
