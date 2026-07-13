import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditSeverity, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { FuelService } from "../fuel/fuel.service";
import { GmailService } from "../gmail/gmail.service";
import { PrismaService } from "../prisma/prisma.service";
import { WhatsAppService } from "../whatsapp/whatsapp.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { SendTraccarCommandDto } from "./dto/send-traccar-command.dto";
import { UpdateTraccarSettingsDto } from "./dto/update-traccar-settings.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

type VehicleFilters = {
  search?: string;
  active?: boolean;
};

type TraccarPosition = {
  id?: number;
  deviceId?: number;
  protocol?: string;
  deviceTime?: string;
  fixTime?: string;
  serverTime?: string;
  outdated?: boolean;
  valid?: boolean;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  course?: number;
  address?: string;
  attributes?: Record<string, unknown>;
};

type TraccarSettingsShape = {
  baseUrl: string | null;
  token: string | null;
  username: string | null;
  password: string | null;
  companyLatitude?: number | Prisma.Decimal | null;
  companyLongitude?: number | Prisma.Decimal | null;
  matchRadiusMeters?: number | null;
  minStopMinutes?: number | null;
};

type TraccarEvent = {
  id: number;
  type: string;
  eventTime?: string;
  serverTime?: string;
  deviceId?: number;
  positionId?: number;
  geofenceId?: number;
  attributes?: Record<string, unknown>;
};

type TraccarDevice = {
  id: number;
  name?: string;
  uniqueId?: string;
  status?: string;
  lastUpdate?: string;
  positionId?: number;
  phone?: string;
  model?: string;
  contact?: string;
  category?: string;
  attributes?: Record<string, unknown>;
};

type TraccarNotification = {
  id?: number;
  type?: string;
  always?: boolean;
  notificators?: string;
  attributes?: Record<string, unknown>;
};

type DesiredTraccarNotification = TraccarNotification & {
  type: string;
};

type TraccarReportStop = {
  deviceId?: number;
  deviceName?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
};

type MatchedRoutePoint = {
  time?: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  accuracyMeters?: number | null;
};

type MatchedRouteResult = {
  mode: "MATCHED" | "GPS_FILTERED";
  distanceKm: number;
  route: MatchedRoutePoint[];
  engine?: "OSRM" | "GPS";
  sampledPoints?: number;
  matchedPoints?: number;
  confidence?: number | null;
  message?: string;
};

type VehicleAlertContext = {
  eventType: string;
  eventId?: number | null;
  traccarDeviceId?: string | null;
  geofenceId?: number | null;
  geofenceName?: string | null;
  positionId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  eventTime?: string | Date | null;
};

type EnrichedTraccarEvent = {
  position?: TraccarPosition | null;
  geofenceName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
};

const MOVEMENT_SPEED_THRESHOLD_KMH = 5;
const GPS_MAX_ACCURACY_METERS = 100;
const GPS_MAX_SEGMENT_SPEED_KMH = 130;
const GPS_MIN_POINT_DISTANCE_METERS = 3;
const OSRM_MAX_MATCH_POINTS = 95;
const LIVE_STALE_SECONDS = 600;
const MONTEVIDEO_UTC_OFFSET_HOURS = 3;

@Injectable()
export class VehiclesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VehiclesService.name);
  private alertTimer?: NodeJS.Timeout;
  private alertSyncRunning = false;
  private dailyFuelSyncRunning = false;
  private lastDailyFuelSyncDate = "";

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly fuelService: FuelService,
    private readonly gmailService: GmailService,
    private readonly whatsAppService: WhatsAppService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.alertTimer = setInterval(() => {
      void this.syncAllVehicleAlerts();
      void this.syncDailyFuelExpensesIfDue();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.alertTimer) {
      clearInterval(this.alertTimer);
    }
  }

  async list(filters: VehicleFilters) {
    const where: Prisma.VehicleWhereInput = {};

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { plate: { contains: query, mode: "insensitive" } },
        { traccarDeviceId: { contains: query, mode: "insensitive" } },
      ];
    }

    return this.prisma.vehicle.findMany({
      where,
      orderBy: [{ active: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
    });
  }

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        name: dto.name.trim(),
        plate: this.cleanOptional(dto.plate),
        make: this.cleanOptional(dto.make),
        model: this.cleanOptional(dto.model),
        color: this.cleanOptional(dto.color),
        colorHex: this.cleanOptional(dto.colorHex),
        icon: this.cleanOptional(dto.icon),
        logoUrl: this.cleanOptional(dto.logoUrl),
        traccarDeviceId: this.cleanOptional(dto.traccarDeviceId),
        fuelKmPerLiter: dto.fuelKmPerLiter,
        active: dto.active ?? true,
        monitoringPhones: this.cleanOptional(dto.monitoringPhones),
        monitoringEmails: this.cleanOptional(dto.monitoringEmails),
        clientShareUrl: this.cleanOptional(dto.clientShareUrl),
        gpsMonitoringEnabled: dto.gpsMonitoringEnabled ?? false,
        gpsWhatsappAlerts: dto.gpsWhatsappAlerts ?? false,
        gpsEmailAlerts: dto.gpsEmailAlerts ?? false,
        gpsEngineCommandsEnabled: dto.gpsEngineCommandsEnabled ?? false,
        gpsAutoEngineStopOnAlarm: dto.gpsAutoEngineStopOnAlarm ?? false,
        gpsCommandTextChannel: dto.gpsCommandTextChannel ?? false,
        gpsStatusCommand: this.cleanOptional(dto.gpsStatusCommand),
        gpsEngineStopCommand: this.cleanOptional(dto.gpsEngineStopCommand),
        gpsEngineResumeCommand: this.cleanOptional(dto.gpsEngineResumeCommand),
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.ensureExists(id);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        name: this.cleanOptional(dto.name),
        plate: this.cleanNullable(dto.plate),
        make: this.cleanNullable(dto.make),
        model: this.cleanNullable(dto.model),
        color: this.cleanNullable(dto.color),
        colorHex: this.cleanNullable(dto.colorHex),
        icon: this.cleanNullable(dto.icon),
        logoUrl: this.cleanNullable(dto.logoUrl),
        traccarDeviceId: this.cleanNullable(dto.traccarDeviceId),
        fuelKmPerLiter: dto.fuelKmPerLiter,
        active: dto.active,
        monitoringPhones: this.cleanNullable(dto.monitoringPhones),
        monitoringEmails: this.cleanNullable(dto.monitoringEmails),
        clientShareUrl: this.cleanNullable(dto.clientShareUrl),
        gpsMonitoringEnabled: dto.gpsMonitoringEnabled,
        gpsWhatsappAlerts: dto.gpsWhatsappAlerts,
        gpsEmailAlerts: dto.gpsEmailAlerts,
        gpsEngineCommandsEnabled: dto.gpsEngineCommandsEnabled,
        gpsAutoEngineStopOnAlarm: dto.gpsAutoEngineStopOnAlarm,
        gpsCommandTextChannel: dto.gpsCommandTextChannel,
        gpsStatusCommand: this.cleanNullable(dto.gpsStatusCommand),
        gpsEngineStopCommand: this.cleanNullable(dto.gpsEngineStopCommand),
        gpsEngineResumeCommand: this.cleanNullable(dto.gpsEngineResumeCommand),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.vehicle.delete({
      where: { id },
    });
  }

  async getTraccarSettings() {
    const settings = await this.prisma.traccarSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    return {
      ...settings,
      token: settings.token ? "********" : "",
      password: settings.password ? "********" : "",
      configured: Boolean(settings.baseUrl && (settings.token || (settings.username && settings.password))),
    };
  }

  async updateTraccarSettings(dto: UpdateTraccarSettingsDto) {
    const current = await this.prisma.traccarSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    const companyCoordinates = this.normalizeCompanyCoordinates(dto.companyLatitude, dto.companyLongitude);
    const data = {
      baseUrl: this.cleanNullable(dto.baseUrl),
      token: dto.token === "********" ? current.token : this.cleanNullable(dto.token),
      username: this.cleanNullable(dto.username),
      password: dto.password === "********" ? current.password : this.cleanNullable(dto.password),
      matchRadiusMeters: dto.matchRadiusMeters,
      minStopMinutes: dto.minStopMinutes,
      companyName: this.cleanOptional(dto.companyName) ?? "Security Solutions",
      companyAddress: this.cleanNullable(dto.companyAddress),
      companyLatitude: companyCoordinates.latitude,
      companyLongitude: companyCoordinates.longitude,
    };

    const settings = await this.prisma.traccarSettings.update({
      where: { id: "default" },
      data,
    });

    return {
      ...settings,
      token: settings.token ? "********" : "",
      password: settings.password ? "********" : "",
      configured: Boolean(settings.baseUrl && (settings.token || (settings.username && settings.password))),
    };
  }

  async traccarDailySummary(id: string, date?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || !vehicle.traccarDeviceId) {
      return this.emptyDailySummary(vehicle, date, "Configura Traccar y vincula el ID del dispositivo.");
    }

    const { from, to } = this.reportRange(date);

    let positions: TraccarPosition[] = [];
    try {
      positions = await this.fetchTraccarPositions(settings, vehicle.traccarDeviceId, from, to);
    } catch (error) {
      return this.emptyDailySummary(vehicle, date, error instanceof Error ? error.message : "No se pudo consultar Traccar.");
    }

    const sorted = positions
      .filter((position) => Number.isFinite(position.latitude) && Number.isFinite(position.longitude))
      .sort((left, right) => this.positionTime(left).getTime() - this.positionTime(right).getTime());
    const routePositions = this.cleanRoutePositions(sorted);
    const matchedRoute = await this.matchRouteToRoads(routePositions);
    const distanceKm = matchedRoute.distanceKm;
    const stops = this.detectStops(routePositions, settings.minStopMinutes || 2, MOVEMENT_SPEED_THRESHOLD_KMH);
    const visits = await this.detectCustomerVisits(stops, settings.matchRadiusMeters || 20);
    const movingMinutes = Math.round(this.calculateMovingMinutes(routePositions, MOVEMENT_SPEED_THRESHOLD_KMH));
    const speedStats = this.calculateSpeedStats(routePositions, MOVEMENT_SPEED_THRESHOLD_KMH);
    const fuelKmPerLiter = Number(vehicle.fuelKmPerLiter) || 10;
    const estimatedLiters = fuelKmPerLiter > 0 ? this.roundNumber(distanceKm / fuelKmPerLiter, 2) : 0;
    const fuel = await this.fuelService.getUruguaySuperPrice();
    const estimatedFuelCost = this.roundNumber(estimatedLiters * fuel.pricePerLiter, 2);

    return {
      vehicle,
      date: from.toISOString().slice(0, 10),
      configured: true,
      positions: sorted.length,
      routePositions: routePositions.length,
      filteredPositions: Math.max(0, sorted.length - routePositions.length),
      routeMode: matchedRoute.mode,
      routeEngine: matchedRoute.engine ?? (matchedRoute.mode === "MATCHED" ? "OSRM" : "GPS"),
      routeSampledPoints: matchedRoute.sampledPoints ?? routePositions.length,
      routeMatchedPoints: matchedRoute.matchedPoints ?? matchedRoute.route.length,
      routeConfidence: matchedRoute.confidence ?? null,
      distanceKm,
      movingMinutes,
      stoppedMinutes: stops.reduce((sum, stop) => sum + stop.durationMinutes, 0),
      minSpeedKmh: speedStats.minSpeedKmh,
      averageSpeedKmh: speedStats.averageSpeedKmh,
      maxSpeedKmh: speedStats.maxSpeedKmh,
      estimatedLiters,
      fuelPricePerLiter: fuel.pricePerLiter,
      estimatedFuelCost,
      stops,
      visits,
      unmatchedStops: stops.filter((stop) => !visits.some((visit) => visit.stopIndex === stop.index)),
      route: matchedRoute.route,
      message: sorted.length ? (matchedRoute.message ?? "") : "Traccar no devolvio posiciones para ese dia.",
    };
  }

  async traccarNativeStopsReport(id: string, date?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || !vehicle.traccarDeviceId) {
      return {
        configured: false,
        vehicle,
        date: this.parseReportDate(date).toISOString().slice(0, 10),
        stops: [],
        visits: [],
        message: "Configura Traccar y vincula el ID del dispositivo.",
      };
    }

    const { from, to } = this.reportRange(date);

    const reportStops = await this.fetchTraccarReportStops(settings, vehicle.traccarDeviceId, from, to);
    const stops = this.cleanNativeReportStops(reportStops
      .map((stop, index) => this.toNativeReportStop(stop, index))
      .filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)), settings);
    const visits = await this.detectCustomerVisits(stops, settings.matchRadiusMeters || 20);

    return {
      configured: true,
      vehicle,
      date: from.toISOString().slice(0, 10),
      stops,
      visits,
      message: stops.length ? "Paradas tomadas desde reporte nativo de Traccar." : "Traccar no devolvio paradas nativas para ese dia.",
    };
  }

  async registerDailyFuelExpense(id: string, date?: string) {
    const summary = await this.traccarDailySummary(id, date);
    const vehicle = summary.vehicle as { id: string; name: string; plate?: string | null };
    if (!summary.configured) {
      throw new BadRequestException(summary.message || "No se pudo calcular el recorrido GPS.");
    }
    if (!vehicle?.id) {
      throw new BadRequestException("No se encontro el vehiculo del resumen GPS.");
    }

    const distanceKm = Number(summary.distanceKm) || 0;
    const estimatedFuelCost = Number(summary.estimatedFuelCost) || 0;
    if (distanceKm <= 0 || estimatedFuelCost <= 0) {
      throw new BadRequestException("El resumen GPS no tiene kilometros o combustible estimado para registrar.");
    }

    const customer = await this.ensureVehicleExpenseCustomer();
    const routePositions = "routePositions" in summary ? (summary.routePositions ?? 0) : 0;
    const routeEngine = "routeEngine" in summary ? summary.routeEngine : null;
    const routeConfidence = "routeConfidence" in summary ? summary.routeConfidence : null;
    const reference = `GPS-FUEL-${vehicle.id}-${summary.date}`;
    const concept = `Combustible GPS ${vehicle.name}${vehicle.plate ? ` (${vehicle.plate})` : ""} - ${summary.date}`;
    const notes = [
      `Resumen automatico 24h desde Traccar.`,
      `Km recorridos: ${this.roundNumber(distanceKm, 2)} km.`,
      `Litros estimados: ${this.roundNumber(Number(summary.estimatedLiters) || 0, 2)} L.`,
      `Precio combustible: ${this.roundNumber(Number(summary.fuelPricePerLiter) || 0, 2)} UYU/L.`,
      `Posiciones: ${summary.positions}. Ruta util: ${routePositions}.`,
      routeEngine ? `Motor ruta: ${routeEngine}.` : "",
      routeConfidence !== null && routeConfidence !== undefined ? `Confianza ruta: ${this.roundNumber(routeConfidence * 100, 0)}%.` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const existing = await this.prisma.payment.findFirst({
      where: {
        reference,
        vehicleId: vehicle.id,
        category: "FUEL",
      },
      include: this.paymentInclude(),
    });

    const paidAt = new Date(`${summary.date}T23:59:00`);
    const data = {
      customerId: customer.id,
      vehicleId: vehicle.id,
      transactionType: "EXPENSE",
      category: "FUEL",
      concept,
      amount: estimatedFuelCost,
      quantity: Math.max(1, Math.round(Number(summary.estimatedLiters) || 1)),
      unitPrice: Number(summary.fuelPricePerLiter) || null,
      currency: "UYU",
      method: "GPS / estimado",
      reference,
      notes,
      dueDate: paidAt,
      paidAt,
    };

    const payment = existing
      ? await this.prisma.payment.update({
          where: { id: existing.id },
          data,
          include: this.paymentInclude(),
        })
      : await this.prisma.payment.create({
          data,
          include: this.paymentInclude(),
        });

    await this.audit.record({
      module: "VEHICLES",
      action: existing ? "GPS_FUEL_EXPENSE_UPDATED" : "GPS_FUEL_EXPENSE_CREATED",
      entityType: "Vehicle",
      entityId: vehicle.id,
      severity: AuditSeverity.WARNING,
      summary: `${existing ? "Actualizado" : "Registrado"} combustible GPS de ${vehicle.name}: ${this.roundNumber(distanceKm, 2)} km / $ ${this.roundNumber(estimatedFuelCost, 2)}`,
      metadata: {
        paymentId: payment.id,
        reference,
        date: summary.date,
        distanceKm,
        estimatedLiters: summary.estimatedLiters,
        estimatedFuelCost,
      },
    });

    return {
      created: !existing,
      updated: Boolean(existing),
      payment,
      summary,
      message: existing
        ? "Gasto de combustible GPS actualizado para ese dia."
        : "Gasto de combustible GPS registrado en Gastos e Ingresos.",
    };
  }

  async traccarLivePosition(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || !vehicle.traccarDeviceId) {
      return {
        configured: false,
        vehicle,
        online: false,
        moving: false,
        message: "Configura Traccar y vincula el ID del dispositivo.",
      };
    }

    try {
      const [device, position] = await Promise.all([
        this.fetchTraccarDevice(settings, vehicle.traccarDeviceId).catch(() => null),
        this.fetchTraccarCurrentPosition(settings, vehicle.traccarDeviceId).catch(() => null),
      ]);
      const resolvedPosition = position ?? (device?.positionId ? await this.fetchTraccarPositionById(settings, device.positionId).catch(() => null) : null);
      const latitude = Number(resolvedPosition?.latitude);
      const longitude = Number(resolvedPosition?.longitude);
      const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude);
      const speedKmh = resolvedPosition ? this.roundNumber(this.positionSpeedKmh(resolvedPosition), 1) : 0;
      const positionTime = resolvedPosition ? this.positionTime(resolvedPosition) : null;
      const lastUpdate = this.parsePositionDate(device?.lastUpdate) ?? positionTime;
      const ageSeconds = lastUpdate ? Math.max(0, Math.round((Date.now() - lastUpdate.getTime()) / 1000)) : null;
      const displayPositionTime = lastUpdate ?? positionTime;
      const attributes = {
        ...(device?.attributes ?? {}),
        ...(resolvedPosition?.attributes ?? {}),
      };

      return {
        configured: true,
        vehicle,
        device: device
          ? {
              id: device.id,
              name: device.name,
              uniqueId: device.uniqueId,
              status: device.status,
              lastUpdate: device.lastUpdate,
              phone: device.phone,
              model: device.model,
              category: device.category,
            }
          : null,
        online: device?.status === "online",
        moving: speedKmh >= MOVEMENT_SPEED_THRESHOLD_KMH || Boolean(attributes.motion),
        stale: ageSeconds === null ? true : ageSeconds > LIVE_STALE_SECONDS,
        ageSeconds,
        latitude: hasPosition ? latitude : null,
        longitude: hasPosition ? longitude : null,
        speedKmh,
        course: Number.isFinite(Number(resolvedPosition?.course)) ? Number(resolvedPosition?.course) : null,
        altitude: Number.isFinite(Number(resolvedPosition?.altitude)) ? Number(resolvedPosition?.altitude) : null,
        accuracyMeters: resolvedPosition ? this.positionAccuracyMeters(resolvedPosition) : null,
        address: resolvedPosition?.address ?? null,
        positionTime: displayPositionTime?.toISOString() ?? null,
        serverTime: resolvedPosition?.serverTime ?? null,
        fixTime: resolvedPosition?.fixTime ?? null,
        mapUrl: hasPosition ? this.googleMapsSearchUrl(latitude, longitude) : null,
        ignition: this.toNullableBoolean(attributes.ignition),
        motion: this.toNullableBoolean(attributes.motion),
        alarm: attributes.alarm ? String(attributes.alarm) : null,
        batteryLevel: this.toNullableNumber(attributes.batteryLevel ?? attributes.battery),
        power: this.toNullableNumber(attributes.power),
        charge: this.toNullableBoolean(attributes.charge),
        attributes,
        message: hasPosition ? "" : "Traccar no devolvio posicion actual para este dispositivo.",
      };
    } catch (error) {
      return {
        configured: true,
        vehicle,
        online: false,
        moving: false,
        message: error instanceof Error ? error.message : "No se pudo consultar la posicion en vivo.",
      };
    }
  }

  async syncCustomerGeofences() {
    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
      return {
        configured: false,
        created: 0,
        updated: 0,
        linked: 0,
        skipped: 0,
        items: [],
        message: "Configura Traccar antes de sincronizar geozonas.",
      };
    }

    const radius = settings.matchRadiusMeters || 20;
    const vehicles = await this.prisma.vehicle.findMany({
      where: { active: true, traccarDeviceId: { not: null } },
      select: { traccarDeviceId: true },
    });
    const customers = await this.prisma.customer.findMany({
      orderBy: { name: "asc" },
      include: { sites: { orderBy: { name: "asc" } } },
    });

    const items: Array<{
      type: "Cliente" | "Sitio";
      id: string;
      name: string;
      status: "created" | "updated" | "skipped" | "error";
      reason?: string;
      geofenceId?: number;
    }> = [];
    let created = 0;
    let updated = 0;
    let linked = 0;
    let skipped = 0;

    for (const customer of customers) {
      const customerCoords = this.resolveCoordinates(customer.latitude, customer.longitude, customer.address);
      if (customerCoords) {
        const result = await this.upsertTraccarGeofence(settings, {
          currentId: customer.traccarGeofenceId,
          name: `CRM Cliente - ${customer.name}`,
          description: customer.address ?? "",
          latitude: customerCoords.latitude,
          longitude: customerCoords.longitude,
          radius,
        });

        if (result.status === "created" || result.status === "updated") {
          await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
              latitude: customerCoords.latitude,
              longitude: customerCoords.longitude,
              traccarGeofenceId: result.geofenceId,
            },
          });
          const linkedCount = await this.linkGeofenceToVehicles(settings, result.geofenceId, vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean) as string[]);
          linked += linkedCount;
          result.status === "created" ? (created += 1) : (updated += 1);
        } else {
          skipped += 1;
        }

        items.push({ type: "Cliente", id: customer.id, name: customer.name, ...result });
      } else if (!customer.sites.length) {
        skipped += 1;
        items.push({ type: "Cliente", id: customer.id, name: customer.name, status: "skipped", reason: "Sin coordenadas" });
      }

      for (const site of customer.sites) {
        const coords = this.resolveCoordinates(site.latitude, site.longitude, site.address);
        if (!coords) {
          skipped += 1;
          items.push({ type: "Sitio", id: site.id, name: `${customer.name} - ${site.name}`, status: "skipped", reason: "Sin coordenadas" });
          continue;
        }

        const result = await this.upsertTraccarGeofence(settings, {
          currentId: site.traccarGeofenceId,
          name: `CRM Sitio - ${customer.name} - ${site.name}`,
          description: site.address,
          latitude: coords.latitude,
          longitude: coords.longitude,
          radius,
        });

        if (result.status === "created" || result.status === "updated") {
          await this.prisma.site.update({
            where: { id: site.id },
            data: {
              latitude: coords.latitude,
              longitude: coords.longitude,
              traccarGeofenceId: result.geofenceId,
            },
          });
          const linkedCount = await this.linkGeofenceToVehicles(settings, result.geofenceId, vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean) as string[]);
          linked += linkedCount;
          result.status === "created" ? (created += 1) : (updated += 1);
        } else {
          skipped += 1;
        }

        items.push({ type: "Sitio", id: site.id, name: `${customer.name} - ${site.name}`, ...result });
      }
    }

    return {
      configured: true,
      created,
      updated,
      linked,
      skipped,
      items,
      message: `Geozonas sincronizadas: ${created} nuevas, ${updated} actualizadas, ${skipped} sin coordenadas.`,
    };
  }

  async traccarEvents(id: string, date?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || !vehicle.traccarDeviceId) {
      return { configured: false, vehicle, events: [], message: "Configura Traccar y vincula el ID del dispositivo." };
    }

    const { from, to } = this.reportRange(date);
    const events = await this.fetchTraccarEvents(settings, vehicle.traccarDeviceId, from, to);

    return { configured: true, vehicle, events, message: events.length ? "" : "Sin eventos Traccar para ese dia." };
  }

  async sendTraccarCommand(id: string, dto: SendTraccarCommandDto) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (!vehicle.traccarDeviceId) {
      throw new BadRequestException("El vehiculo no tiene dispositivo Traccar vinculado.");
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl) {
      throw new BadRequestException("Configura Traccar antes de enviar comandos.");
    }

    if (["engineStop", "engineResume"].includes(dto.command) && !vehicle.gpsEngineCommandsEnabled) {
      throw new BadRequestException("Los comandos de motor no estan habilitados para este vehiculo.");
    }
    if (dto.command === "engineStop" && dto.confirmation !== "BLOQUEAR") {
      throw new BadRequestException("Para bloquear motor debes confirmar escribiendo BLOQUEAR.");
    }
    if (dto.command === "engineResume" && dto.confirmation !== "RESTAURAR") {
      throw new BadRequestException("Para restaurar motor debes confirmar escribiendo RESTAURAR.");
    }

    const command = this.buildTraccarCommandPayload(vehicle, dto.command);
    const response = await this.traccarRequest(settings, "/api/commands/send", {
      method: "POST",
      body: JSON.stringify({
        id: 0,
        deviceId: Number(vehicle.traccarDeviceId),
        textChannel: vehicle.gpsCommandTextChannel,
        description: this.traccarCommandLabel(dto.command),
        ...command,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException(`Traccar no acepto el comando (${response.status}).`);
    }

    const result = await response.json().catch(() => ({}));
    await this.sendVehicleWhatsApp(vehicle, this.buildCommandWhatsAppMessage(vehicle, dto.command), {
      onlyIfEnabled: false,
      context: { eventType: `command:${dto.command}`, traccarDeviceId: vehicle.traccarDeviceId },
    });
    await this.audit.record({
      module: "VEHICLES",
      action: "TRACCAR_COMMAND_SENT",
      entityType: "Vehicle",
      entityId: vehicle.id,
      severity: dto.command === "status" ? AuditSeverity.INFO : AuditSeverity.CRITICAL,
      summary: `${this.traccarCommandLabel(dto.command)} enviado a ${vehicle.name}`,
      metadata: {
        command: dto.command,
        commandMode: command.type === "custom" ? "custom" : "traccar-type",
        textChannel: vehicle.gpsCommandTextChannel,
        customCommandConfigured: command.type === "custom",
        traccarDeviceId: vehicle.traccarDeviceId,
        plate: vehicle.plate,
      },
    });

    return {
      sent: true,
      command: dto.command,
      commandMode: command.type === "custom" ? "custom" : "traccar-type",
      textChannel: vehicle.gpsCommandTextChannel,
      vehicle,
      result,
      message:
        command.type === "custom"
          ? `${this.traccarCommandLabel(dto.command)} enviado con comando especifico del GPS.`
          : `${this.traccarCommandLabel(dto.command)} enviado a Traccar con comando generico.`,
    };
  }

  async sendVehicleTestWhatsApp(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const phones = this.vehiclePhones(vehicle);
    if (!phones.length) {
      throw new BadRequestException("Agrega telefonos WhatsApp para este vehiculo.");
    }

    const message = [
      "Security Solutions - prueba de monitoreo GPS",
      `Vehiculo: ${vehicle.name}${vehicle.plate ? ` (${vehicle.plate})` : ""}`,
      `Traccar ID: ${vehicle.traccarDeviceId || "sin vincular"}`,
      "Este numero recibira alertas configuradas para este vehiculo.",
    ].join("\n");
    const results = await this.sendVehicleWhatsApp(vehicle, message, {
      onlyIfEnabled: false,
      context: { eventType: "test-whatsapp", traccarDeviceId: vehicle.traccarDeviceId },
    });

    const sent = results.filter((result) => result.sent !== false).length;
    const failed = results.filter((result) => result.sent === false).length;
    await this.audit.record({
      module: "VEHICLES",
      action: "WHATSAPP_TEST_SENT",
      entityType: "Vehicle",
      entityId: vehicle.id,
      severity: failed ? AuditSeverity.WARNING : AuditSeverity.INFO,
      summary: `Prueba WhatsApp de ${vehicle.name}: ${sent} enviada(s), ${failed} fallida(s)`,
      metadata: {
        phones,
        sent,
        failed,
        traccarDeviceId: vehicle.traccarDeviceId,
      },
    });

    return {
      sent,
      failed,
      phones,
      results,
      message: sent ? `Prueba WhatsApp enviada: ${sent}${failed ? `, fallidas: ${failed}` : ""}.` : "No se pudo enviar la prueba WhatsApp.",
    };
  }

  async traccarAlertLogs(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const logs = await this.prisma.vehicleAlertLog.findMany({
      where: { vehicleId: id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return { vehicle, logs };
  }

  async syncVehicleAlerts(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (!vehicle.traccarDeviceId || !vehicle.gpsMonitoringEnabled) {
      return { sent: 0, events: [], message: "Monitoreo GPS no habilitado o dispositivo sin vincular." };
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl) {
      return { sent: 0, events: [], message: "Configura Traccar antes de sincronizar alertas." };
    }

    const to = new Date();
    const from = vehicle.gpsLastAlertAt ? new Date(vehicle.gpsLastAlertAt) : new Date(to.getTime() - 6 * 60 * 60 * 1000);
    const events = await this.fetchTraccarEvents(settings, vehicle.traccarDeviceId, from, to);
    const newEvents = events
      .filter((event) => !vehicle.gpsLastEventId || event.id > vehicle.gpsLastEventId)
      .filter((event) => this.isCriticalTraccarEvent(event));
    const latestId = events.reduce((max, event) => Math.max(max, event.id), vehicle.gpsLastEventId ?? 0);

    let sent = 0;
    let failed = 0;
    for (const event of newEvents) {
      const enriched = await this.enrichTraccarEvent(settings, event);
      const message = this.buildEventWhatsAppMessage(vehicle, event, enriched);
      const context = {
        eventType: event.type,
        eventId: event.id,
        traccarDeviceId: vehicle.traccarDeviceId,
        geofenceId: event.geofenceId,
        geofenceName: enriched.geofenceName,
        positionId: event.positionId,
        latitude: enriched.latitude,
        longitude: enriched.longitude,
        mapUrl: enriched.mapUrl,
        eventTime: event.eventTime ?? event.serverTime,
      };
      const whatsappResults = await this.sendVehicleWhatsApp(vehicle, message, {
        onlyIfEnabled: true,
        context,
      });
      const emailResults = await this.sendVehicleEmail(vehicle, `Alerta GPS ${this.traccarEventLabel(event.type)} - ${vehicle.name}`, message, {
        onlyIfEnabled: true,
        context,
      });
      const results = [...whatsappResults, ...emailResults];
      sent += results.filter((result) => result.sent !== false).length;
      failed += results.filter((result) => result.sent === false).length;
    }

    if (!newEvents.length || sent > 0) {
      await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          gpsLastEventId: latestId || vehicle.gpsLastEventId,
          gpsLastAlertAt: new Date(),
        },
      });
    }
    await this.audit.record({
      module: "VEHICLES",
      action: "TRACCAR_ALERTS_SYNCED",
      entityType: "Vehicle",
      entityId: vehicle.id,
      severity: failed ? AuditSeverity.WARNING : AuditSeverity.INFO,
      summary: `Sincronizacion Traccar de ${vehicle.name}: ${newEvents.length} evento(s), ${sent} alerta(s), ${failed} falla(s)`,
      metadata: {
        traccarDeviceId: vehicle.traccarDeviceId,
        from: from.toISOString(),
        to: to.toISOString(),
        latestId,
        eventIds: newEvents.map((event) => event.id),
        sent,
        failed,
      },
    });

    return {
      sent,
      failed,
      events: newEvents,
      message: sent
        ? `Alertas enviadas: ${sent}${failed ? `, fallidas: ${failed}` : ""}.`
        : failed
          ? `No se pudieron enviar alertas (${failed} intento/s fallidos).`
          : "Sin alertas nuevas.",
    };
  }

  async configureTraccarNotifications(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
    if (!vehicle.traccarDeviceId) {
      throw new BadRequestException("El vehiculo no tiene dispositivo Traccar vinculado.");
    }

    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
      throw new BadRequestException("Configura Traccar antes de crear notificaciones.");
    }

    const desired = this.defaultTraccarNotifications();
    const existing = await this.fetchTraccarNotifications(settings);
    const results = [];

    for (const notification of desired) {
      const current = existing.find((item) => item.type === notification.type && this.hasTraccarNotificator(item.notificators, "web"));
      const saved = current?.id
        ? await this.updateTraccarNotification(settings, current.id, { ...current, ...notification, notificators: this.mergeTraccarNotificators(current.notificators, "web") })
        : await this.createTraccarNotification(settings, notification);
      const linked = saved.id ? await this.linkNotificationToDevice(settings, saved.id, vehicle.traccarDeviceId) : false;
      results.push({
        type: notification.type,
        label: this.traccarEventLabel(notification.type),
        notificationId: saved.id ?? null,
        status: current?.id ? "actualizada" : "creada",
        linked,
      });
    }

    await this.audit.record({
      module: "VEHICLES",
      action: "TRACCAR_NOTIFICATIONS_CONFIGURED",
      entityType: "Vehicle",
      entityId: vehicle.id,
      severity: AuditSeverity.INFO,
      summary: `Notificaciones Traccar configuradas para ${vehicle.name}`,
      metadata: {
        traccarDeviceId: vehicle.traccarDeviceId,
        notifications: results,
      },
    });

    return {
      configured: true,
      vehicle,
      notifications: results,
      message: `Traccar configurado: ${results.length} notificaciones web vinculadas al vehiculo.`,
    };
  }

  private async syncAllVehicleAlerts() {
    if (this.alertSyncRunning) {
      return;
    }

    this.alertSyncRunning = true;
    try {
      const vehicles = await this.prisma.vehicle.findMany({
        where: {
          active: true,
          gpsMonitoringEnabled: true,
          OR: [{ gpsWhatsappAlerts: true }, { gpsEmailAlerts: true }],
          traccarDeviceId: { not: null },
        },
        select: { id: true },
      });

      for (const vehicle of vehicles) {
        try {
          await this.syncVehicleAlerts(vehicle.id);
        } catch (error) {
          this.logger.warn(`No se pudieron sincronizar alertas GPS del vehiculo ${vehicle.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } finally {
      this.alertSyncRunning = false;
    }
  }

  private async syncDailyFuelExpensesIfDue() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < 23 * 60 + 55 || this.lastDailyFuelSyncDate === today || this.dailyFuelSyncRunning) {
      return;
    }

    this.dailyFuelSyncRunning = true;
    try {
      const vehicles = await this.prisma.vehicle.findMany({
        where: {
          active: true,
          traccarDeviceId: { not: null },
        },
        select: { id: true },
      });

      for (const vehicle of vehicles) {
        try {
          await this.registerDailyFuelExpense(vehicle.id, today);
        } catch (error) {
          this.logger.warn(`No se pudo registrar combustible GPS automatico del vehiculo ${vehicle.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.lastDailyFuelSyncDate = today;
    } finally {
      this.dailyFuelSyncRunning = false;
    }
  }

  async syncCustomerGeofenceById(customerId: string) {
    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
      return { configured: false, status: "skipped" as const, reason: "Configura Traccar antes de sincronizar geozonas." };
    }

    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    const coords = this.resolveCoordinates(customer.latitude, customer.longitude, customer.address);
    if (!coords) {
      return { configured: true, status: "skipped" as const, reason: "Sin coordenadas" };
    }

    const result = await this.upsertTraccarGeofence(settings, {
      currentId: customer.traccarGeofenceId,
      name: `CRM Cliente - ${customer.name}`,
      description: customer.address ?? "",
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius: settings.matchRadiusMeters || 20,
    });

    if (result.status !== "created" && result.status !== "updated") {
      return { configured: true, ...result };
    }

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        traccarGeofenceId: result.geofenceId,
      },
    });

    const vehicles = await this.prisma.vehicle.findMany({
      where: { active: true, traccarDeviceId: { not: null } },
      select: { traccarDeviceId: true },
    });
    const linked = await this.linkGeofenceToVehicles(
      settings,
      result.geofenceId,
      vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean) as string[],
    );

    return { configured: true, ...result, linked };
  }

  async syncSiteGeofenceById(siteId: string) {
    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
      return { configured: false, status: "skipped" as const, reason: "Configura Traccar antes de sincronizar geozonas." };
    }

    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!site) {
      throw new NotFoundException("Site not found");
    }

    const coords = this.resolveCoordinates(site.latitude, site.longitude, site.address);
    if (!coords) {
      return { configured: true, status: "skipped" as const, reason: "Sin coordenadas" };
    }

    const result = await this.upsertTraccarGeofence(settings, {
      currentId: site.traccarGeofenceId,
      name: `CRM Sitio - ${site.customer.name} - ${site.name}`,
      description: site.address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius: settings.matchRadiusMeters || 20,
    });

    if (result.status !== "created" && result.status !== "updated") {
      return { configured: true, ...result };
    }

    await this.prisma.site.update({
      where: { id: site.id },
      data: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        traccarGeofenceId: result.geofenceId,
      },
    });

    const vehicles = await this.prisma.vehicle.findMany({
      where: { active: true, traccarDeviceId: { not: null } },
      select: { traccarDeviceId: true },
    });
    const linked = await this.linkGeofenceToVehicles(
      settings,
      result.geofenceId,
      vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean) as string[],
    );

    return { configured: true, ...result, linked };
  }

  async syncDispatchStopGeofence(stop: {
    id: string;
    title: string;
    address?: string | null;
    notes?: string | null;
    zone?: string | null;
    placeType?: string | null;
    latitude?: Prisma.Decimal | number | string | null;
    longitude?: Prisma.Decimal | number | string | null;
    vehicleId?: string | null;
    traccarGeofenceId?: number | null;
  }) {
    const settings = await this.prisma.traccarSettings.findUnique({ where: { id: "default" } });
    if (!settings?.baseUrl || (!settings.token && (!settings.username || !settings.password))) {
      return { configured: false, status: "skipped" as const, reason: "Configura Traccar antes de crear geozonas." };
    }

    const latitude = Number(stop.latitude);
    const longitude = Number(stop.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { configured: true, status: "skipped" as const, reason: "La parada no tiene coordenadas validas." };
    }

    const radius = Math.max(10, Math.min(Number(settings.matchRadiusMeters) || 20, 25));
    const placeLabel = this.dispatchPlaceTypeLabel(stop.placeType);
    const title = this.cleanGeofenceTitle(stop.title);
    const description = [
      stop.notes?.trim() ? `Descripcion: ${stop.notes.trim()}` : "",
      stop.address?.trim() ? `Direccion: ${stop.address.trim()}` : "",
      stop.zone?.trim() ? `Zona: ${stop.zone.trim()}` : "",
      `Tipo: ${placeLabel}`,
      "Origen: parada guardada en el CRM",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await this.upsertTraccarGeofence(settings, {
      currentId: stop.traccarGeofenceId,
      name: `CRM ${placeLabel} - ${title}`,
      description,
      latitude,
      longitude,
      radius,
    });

    if (result.status !== "created" && result.status !== "updated") {
      return { configured: true, ...result };
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where: stop.vehicleId
        ? { id: stop.vehicleId, active: true, traccarDeviceId: { not: null } }
        : { active: true, traccarDeviceId: { not: null } },
      select: { traccarDeviceId: true },
    });
    const linked = await this.linkGeofenceToVehicles(
      settings,
      result.geofenceId,
      vehicles.map((vehicle) => vehicle.traccarDeviceId).filter(Boolean) as string[],
    );

    return { configured: true, ...result, linked, radius };
  }

  private async fetchTraccarEvents(settings: TraccarSettingsShape, deviceId: string, from: Date, to: Date) {
    const baseUrl = settings.baseUrl?.replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("Configura la URL de Traccar.");
    }

    const url = new URL(`${baseUrl}/api/reports/events`);
    url.searchParams.set("deviceId", deviceId);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());

    const response = await fetch(url, { headers: this.traccarHeaders(settings) });
    if (!response.ok) {
      throw new Error(`Traccar respondio ${response.status} al consultar eventos.`);
    }

    return ((await response.json()) as TraccarEvent[]).sort((left, right) => left.id - right.id);
  }

  private vehiclePhones(vehicle: { monitoringPhones?: string | null }) {
    return (vehicle.monitoringPhones ?? "")
      .split(/[\n,;]+/)
      .map((phone) => phone.trim())
      .filter(Boolean);
  }

  private vehicleEmails(vehicle: { monitoringEmails?: string | null }) {
    return (vehicle.monitoringEmails ?? "")
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter(Boolean);
  }

  private async sendVehicleWhatsApp(
    vehicle: { id: string; monitoringPhones?: string | null; gpsWhatsappAlerts?: boolean },
    message: string,
    options: { onlyIfEnabled: boolean; context?: VehicleAlertContext },
  ) {
    if (options.onlyIfEnabled && !vehicle.gpsWhatsappAlerts) {
      return [];
    }

    const phones = this.vehiclePhones(vehicle);
    const results = [];
    for (const phone of phones) {
      try {
        const result = await this.withTimeout(this.whatsAppService.send({ to: phone, message }), 25000);
        results.push(result);
        await this.logVehicleAlert(vehicle.id, phone, message, result.sent === false ? "FAILED" : "SENT", "WHATSAPP", options.context, null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ to: phone, sent: false, error: errorMessage });
        await this.logVehicleAlert(vehicle.id, phone, message, "FAILED", "WHATSAPP", options.context, errorMessage);
      }
    }

    return results;
  }

  private async sendVehicleEmail(
    vehicle: { id: string; name: string; plate?: string | null; monitoringEmails?: string | null; gpsEmailAlerts?: boolean },
    subject: string,
    message: string,
    options: { onlyIfEnabled: boolean; context?: VehicleAlertContext },
  ) {
    if (options.onlyIfEnabled && !vehicle.gpsEmailAlerts) {
      return [];
    }

    const emails = this.vehicleEmails(vehicle);
    const results = [];
    for (const email of emails) {
      try {
        const result = await this.gmailService.send({ to: email, subject, message });
        results.push(result);
        await this.logVehicleAlert(vehicle.id, email, message, "SENT", "EMAIL", options.context, null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ to: email, sent: false, error: errorMessage });
        await this.logVehicleAlert(vehicle.id, email, message, "FAILED", "EMAIL", options.context, errorMessage);
      }
    }

    return results;
  }

  private async logVehicleAlert(
    vehicleId: string,
    target: string,
    message: string,
    status: "SENT" | "FAILED",
    channel: "WHATSAPP" | "EMAIL",
    context?: VehicleAlertContext,
    error?: string | null,
  ) {
    try {
      await this.prisma.vehicleAlertLog.create({
        data: {
          vehicleId,
          phone: target,
          channel,
          message,
          status,
          eventType: context?.eventType ?? "whatsapp",
          eventId: context?.eventId ?? undefined,
          traccarDeviceId: context?.traccarDeviceId ?? undefined,
          geofenceId: context?.geofenceId ?? undefined,
          geofenceName: context?.geofenceName ?? undefined,
          positionId: context?.positionId ?? undefined,
          latitude: context?.latitude ?? undefined,
          longitude: context?.longitude ?? undefined,
          mapUrl: context?.mapUrl ?? undefined,
          eventTime: context?.eventTime ? new Date(context.eventTime) : undefined,
          error: error || undefined,
        },
      });
    } catch (logError) {
      this.logger.warn(`No se pudo registrar alerta GPS: ${logError instanceof Error ? logError.message : String(logError)}`);
    }
  }

  private traccarCommandLabel(command: SendTraccarCommandDto["command"]) {
    const labels = {
      status: "Consultar estado",
      engineStop: "Bloquear motor",
      engineResume: "Restaurar motor",
    };
    return labels[command];
  }

  private buildTraccarCommandPayload(
    vehicle: {
      gpsStatusCommand?: string | null;
      gpsEngineStopCommand?: string | null;
      gpsEngineResumeCommand?: string | null;
    },
    command: SendTraccarCommandDto["command"],
  ) {
    const customCommands: Record<SendTraccarCommandDto["command"], string | null | undefined> = {
      status: vehicle.gpsStatusCommand || "STATUS#",
      engineStop: vehicle.gpsEngineStopCommand,
      engineResume: vehicle.gpsEngineResumeCommand,
    };
    const customCommand = customCommands[command]?.trim();

    if (customCommand) {
      return { type: "custom", attributes: { data: customCommand } };
    }

    return { type: command, attributes: {} };
  }

  private buildCommandWhatsAppMessage(vehicle: { name: string; plate?: string | null }, command: SendTraccarCommandDto["command"]) {
    return [
      "Security Solutions - comando GPS",
      `Vehiculo: ${vehicle.name}${vehicle.plate ? ` (${vehicle.plate})` : ""}`,
      `Comando: ${this.traccarCommandLabel(command)}`,
      `Fecha: ${new Date().toLocaleString("es-UY", { timeZone: "America/Montevideo" })}`,
    ].join("\n");
  }

  private buildEventWhatsAppMessage(vehicle: { name: string; plate?: string | null }, event: TraccarEvent, enriched: EnrichedTraccarEvent = {}) {
    const details = this.traccarEventDetails(event);
    return [
      "Security Solutions - alerta GPS",
      `Vehiculo: ${vehicle.name}${vehicle.plate ? ` (${vehicle.plate})` : ""}`,
      `Evento: ${this.traccarEventLabel(event.type)}`,
      event.eventTime ? `Hora: ${new Date(event.eventTime).toLocaleString("es-UY", { timeZone: "America/Montevideo" })}` : "",
      enriched.geofenceName ? `Geozona: ${enriched.geofenceName}` : "",
      details ? `Detalle: ${details}` : "",
      enriched.latitude !== undefined && enriched.longitude !== undefined ? `Ubicacion: ${this.roundNumber(enriched.latitude ?? 0, 6)}, ${this.roundNumber(enriched.longitude ?? 0, 6)}` : "",
      enriched.mapUrl ? `Mapa: ${enriched.mapUrl}` : "",
      event.positionId ? `Posicion ID: ${event.positionId}` : "",
      event.geofenceId && !enriched.geofenceName ? `Geozona ID: ${event.geofenceId}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  private async enrichTraccarEvent(settings: TraccarSettingsShape, event: TraccarEvent): Promise<EnrichedTraccarEvent> {
    const [position, geofenceName] = await Promise.all([
      event.positionId ? this.fetchTraccarPositionById(settings, event.positionId).catch(() => null) : Promise.resolve(null),
      event.geofenceId ? this.resolveGeofenceName(settings, event.geofenceId).catch(() => null) : Promise.resolve(null),
    ]);
    const latitude = Number(position?.latitude);
    const longitude = Number(position?.longitude);
    const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude);

    return {
      position,
      geofenceName,
      latitude: hasPosition ? latitude : null,
      longitude: hasPosition ? longitude : null,
      mapUrl: hasPosition ? this.googleMapsSearchUrl(latitude, longitude) : null,
    };
  }

  private async fetchTraccarPositionById(settings: TraccarSettingsShape, positionId: number) {
    const response = await this.traccarRequest(settings, `/api/positions?id=${encodeURIComponent(String(positionId))}`, {
      method: "GET",
    });
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as TraccarPosition[] | TraccarPosition;
    return Array.isArray(data) ? data[0] ?? null : data;
  }

  private async resolveGeofenceName(settings: TraccarSettingsShape, geofenceId: number) {
    const [customer, site, dispatchStop] = await Promise.all([
      this.prisma.customer.findFirst({
        where: { traccarGeofenceId: geofenceId },
        select: { name: true },
      }),
      this.prisma.site.findFirst({
        where: { traccarGeofenceId: geofenceId },
        select: { name: true, customer: { select: { name: true } } },
      }),
      this.prisma.dispatchStop.findFirst({
        where: { traccarGeofenceId: geofenceId },
        select: { title: true, notes: true, address: true, placeType: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    if (site) {
      return `${site.customer.name} - ${site.name}`;
    }
    if (customer) {
      return customer.name;
    }
    if (dispatchStop) {
      return this.cleanGeofenceTitle(dispatchStop.notes || dispatchStop.title || dispatchStop.address || this.dispatchPlaceTypeLabel(dispatchStop.placeType));
    }

    const response = await this.traccarRequest(settings, `/api/geofences/${geofenceId}`, { method: "GET" });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { name?: string };
    return data.name ?? null;
  }

  private cleanGeofenceTitle(value?: string | null) {
    const clean = (value ?? "").replace(/\s+/g, " ").trim();
    return clean || "Lugar guardado";
  }

  private dispatchPlaceTypeLabel(type?: string | null) {
    const labels: Record<string, string> = {
      CLIENT: "Cliente",
      FUTURE_CLIENT: "Posible cliente",
      IMPORTER: "Proveedor",
      WAREHOUSE: "Base operativa",
      LUNCH: "Almuerzo",
      TRANSFER: "Traslado",
      OTHER: "Lugar conocido",
    };
    return labels[type ?? ""] ?? "Lugar conocido";
  }

  private googleMapsSearchUrl(latitude: number, longitude: number) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }

  private traccarEventDetails(event: TraccarEvent) {
    const attributes = event.attributes ?? {};
    const alarm = attributes.alarm ? `alarma ${String(attributes.alarm)}` : "";
    const speed = attributes.speed ? `velocidad ${String(attributes.speed)}` : "";
    const result = attributes.result ? `resultado ${String(attributes.result)}` : "";
    const ignition = attributes.ignition !== undefined ? `contacto ${attributes.ignition ? "encendido" : "apagado"}` : "";
    return [alarm, speed, ignition, result].filter(Boolean).join(" - ");
  }

  private traccarEventLabel(type: string) {
    const labels: Record<string, string> = {
      alarm: "Alarma / panico",
      deviceOffline: "GPS desconectado",
      deviceOnline: "GPS conectado",
      deviceOverspeed: "Exceso de velocidad",
      deviceMoving: "Vehiculo en movimiento",
      deviceStopped: "Vehiculo detenido",
      geofenceEnter: "Entrada a geozona",
      geofenceExit: "Salida de geozona",
      ignitionOn: "Ignicion encendida",
      ignitionOff: "Ignicion apagada",
      commandResult: "Resultado de comando",
    };
    return labels[type] ?? type;
  }

  private isCriticalTraccarEvent(event: TraccarEvent) {
    return [
      "alarm",
      "deviceOffline",
      "deviceOnline",
      "deviceOverspeed",
      "deviceMoving",
      "deviceStopped",
      "geofenceEnter",
      "geofenceExit",
      "ignitionOn",
      "ignitionOff",
      "commandResult",
    ].includes(event.type);
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error("Tiempo agotado esperando WhatsApp.")), timeoutMs);
      }),
    ]);
  }

  private async fetchTraccarPositions(settings: TraccarSettingsShape, deviceId: string, from: Date, to: Date) {
    const baseUrl = settings.baseUrl?.replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("Configura la URL de Traccar.");
    }

    const url = new URL(`${baseUrl}/api/positions`);
    url.searchParams.set("deviceId", deviceId);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());

    const headers = this.traccarHeaders(settings);

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Traccar respondio ${response.status}. Revisa URL, credenciales o ID del dispositivo.`);
    }

    return (await response.json()) as TraccarPosition[];
  }

  private async fetchTraccarReportStops(settings: TraccarSettingsShape, deviceId: string, from: Date, to: Date) {
    const baseUrl = settings.baseUrl?.replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("Configura la URL de Traccar.");
    }

    const url = new URL(`${baseUrl}/api/reports/stops`);
    url.searchParams.set("deviceId", deviceId);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());

    const response = await fetch(url, { headers: this.traccarHeaders(settings) });
    if (!response.ok) {
      throw new Error(`Traccar respondio ${response.status}. No se pudo leer el reporte nativo de paradas.`);
    }

    return (await response.json()) as TraccarReportStop[];
  }

  private toNativeReportStop(stop: TraccarReportStop, index: number) {
    const arrival = stop.startTime ?? stop.endTime ?? new Date().toISOString();
    const departure = stop.endTime ?? stop.startTime ?? arrival;
    const latitude = Number(stop.latitude);
    const longitude = Number(stop.longitude);

    return {
      index,
      latitude,
      longitude,
      address: stop.address ?? "",
      arrival,
      departure,
      durationMinutes: this.traccarDurationMinutes(stop.duration, arrival, departure),
      source: "TRACCAR_REPORT" as const,
    };
  }

  private cleanNativeReportStops(
    stops: ReturnType<typeof this.toNativeReportStop>[],
    settings: TraccarSettingsShape,
  ) {
    const baseLatitude = Number(settings.companyLatitude);
    const baseLongitude = Number(settings.companyLongitude);
    const hasBase = Number.isFinite(baseLatitude) && Number.isFinite(baseLongitude);
    const duplicateRadiusMeters = 25;
    const baseResidualRadiusMeters = Math.max(50, Number(settings.matchRadiusMeters) || 20);

    return stops
      .filter((stop, index) => {
        const durationMinutes = Number(stop.durationMinutes) || 0;
        const hasAddress = Boolean(stop.address?.trim());
        const previous = stops[index - 1];
        const distanceFromPrevious = previous
          ? this.haversineKm(stop.latitude, stop.longitude, previous.latitude, previous.longitude) * 1000
          : Number.POSITIVE_INFINITY;
        const distanceFromBase = hasBase
          ? this.haversineKm(stop.latitude, stop.longitude, baseLatitude, baseLongitude) * 1000
          : Number.POSITIVE_INFINITY;

        if (durationMinutes <= 0 && distanceFromBase <= baseResidualRadiusMeters) {
          return false;
        }

        if (durationMinutes <= 0 && !hasAddress && distanceFromPrevious <= duplicateRadiusMeters) {
          return false;
        }

        return true;
      })
      .map((stop, index) => ({ ...stop, index }));
  }

  private traccarDurationMinutes(duration: number | undefined, arrival: string, departure: string) {
    const numericDuration = Number(duration);
    if (Number.isFinite(numericDuration) && numericDuration > 0) {
      return Math.max(0, Math.round(numericDuration / 60_000));
    }

    const start = new Date(arrival).getTime();
    const end = new Date(departure).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      return 0;
    }

    return Math.max(0, Math.round((end - start) / 60_000));
  }

  private async fetchTraccarCurrentPosition(settings: TraccarSettingsShape, deviceId: string) {
    const response = await this.traccarRequest(settings, `/api/positions?deviceId=${encodeURIComponent(deviceId)}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Traccar respondio ${response.status}. No se pudo leer la posicion actual.`);
    }

    const data = (await response.json()) as TraccarPosition[] | TraccarPosition;
    return Array.isArray(data) ? data[0] ?? null : data;
  }

  private async fetchTraccarDevice(settings: TraccarSettingsShape, deviceId: string) {
    const response = await this.traccarRequest(settings, `/api/devices/${encodeURIComponent(deviceId)}`, {
      method: "GET",
    });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as TraccarDevice;
  }

  private defaultTraccarNotifications(): DesiredTraccarNotification[] {
    return [
      "geofenceEnter",
      "geofenceExit",
      "deviceOverspeed",
      "alarm",
      "ignitionOn",
      "ignitionOff",
      "deviceOnline",
      "deviceOffline",
      "commandResult",
    ].map((type) => ({
      type,
      always: true,
      notificators: "web",
      attributes: {
        source: "security-control-center",
        label: this.traccarEventLabel(type),
      },
    }));
  }

  private async fetchTraccarNotifications(settings: TraccarSettingsShape) {
    const response = await this.traccarRequest(settings, "/api/notifications", { method: "GET" });
    if (!response.ok) {
      throw new BadRequestException(`Traccar no permitio consultar notificaciones (${response.status}).`);
    }

    return (await response.json()) as TraccarNotification[];
  }

  private async createTraccarNotification(settings: TraccarSettingsShape, notification: TraccarNotification) {
    const response = await this.traccarRequest(settings, "/api/notifications", {
      method: "POST",
      body: JSON.stringify({
        id: 0,
        ...notification,
      }),
    });
    if (!response.ok) {
      throw new BadRequestException(`Traccar no permitio crear notificacion ${notification.type} (${response.status}).`);
    }

    return (await response.json()) as TraccarNotification;
  }

  private async updateTraccarNotification(settings: TraccarSettingsShape, id: number, notification: TraccarNotification) {
    const response = await this.traccarRequest(settings, `/api/notifications/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...notification,
        id,
      }),
    });
    if (!response.ok) {
      return notification;
    }

    return (await response.json().catch(() => ({ ...notification, id }))) as TraccarNotification;
  }

  private async linkNotificationToDevice(settings: TraccarSettingsShape, notificationId: number, deviceId: string) {
    const response = await this.traccarRequest(settings, "/api/permissions", {
      method: "POST",
      body: JSON.stringify({ deviceId: Number(deviceId), notificationId }),
    });

    return response.ok || response.status === 400;
  }

  private hasTraccarNotificator(notificators: string | undefined, target: string) {
    return (notificators ?? "")
      .split(/[, ]+/)
      .map((item) => item.trim().toLowerCase())
      .includes(target.toLowerCase());
  }

  private mergeTraccarNotificators(notificators: string | undefined, target: string) {
    const values = new Set(
      (notificators ?? "")
        .split(/[, ]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    );
    values.add(target);
    return Array.from(values).join(",");
  }

  private async upsertTraccarGeofence(
    settings: TraccarSettingsShape,
    geofence: { currentId?: number | null; name: string; description: string; latitude: number; longitude: number; radius: number },
  ) {
    const body = {
      name: geofence.name.slice(0, 120),
      description: geofence.description,
      area: `CIRCLE (${geofence.latitude} ${geofence.longitude}, ${geofence.radius})`,
      attributes: {
        source: "security-control-center",
      },
    };

    if (geofence.currentId) {
      const update = await this.traccarRequest(settings, `/api/geofences/${geofence.currentId}`, {
        method: "PUT",
        body: JSON.stringify({ id: geofence.currentId, ...body }),
      });
      if (update.ok) {
        return { status: "updated" as const, geofenceId: geofence.currentId };
      }
    }

    const create = await this.traccarRequest(settings, "/api/geofences", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!create.ok) {
      return { status: "error" as const, reason: `Traccar respondio ${create.status}` };
    }

    const data = (await create.json()) as { id?: number };
    return data.id ? { status: "created" as const, geofenceId: data.id } : { status: "error" as const, reason: "Traccar no devolvio ID" };
  }

  private async linkGeofenceToVehicles(settings: TraccarSettingsShape, geofenceId: number, deviceIds: string[]) {
    let linked = 0;
    for (const deviceId of deviceIds) {
      const response = await this.traccarRequest(settings, "/api/permissions", {
        method: "POST",
        body: JSON.stringify({ deviceId: Number(deviceId), geofenceId }),
      });
      if (response.ok || response.status === 400) {
        linked += 1;
      }
    }

    return linked;
  }

  private traccarRequest(settings: TraccarSettingsShape, path: string, init: RequestInit = {}) {
    const baseUrl = settings.baseUrl?.replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("Configura la URL de Traccar.");
    }

    return fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.traccarHeaders(settings),
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  }

  private traccarHeaders(settings: TraccarSettingsShape) {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (settings.token) {
      headers.Authorization = `Bearer ${settings.token}`;
    } else if (settings.username && settings.password) {
      headers.Authorization = `Basic ${Buffer.from(`${settings.username}:${settings.password}`).toString("base64")}`;
    }

    return headers;
  }

  private async detectCustomerVisits(stops: ReturnType<VehiclesService["detectStops"]>, matchRadiusMeters: number) {
    const customers = await this.prisma.customer.findMany({
      include: { sites: true },
      orderBy: { name: "asc" },
    });

    const visits: Array<{
      stopIndex: number;
      customerId: string;
      customerName: string;
      customerType?: string;
      siteId?: string;
      siteName?: string;
      address?: string;
      arrival: string;
      departure: string;
      durationMinutes: number;
      match: "GPS" | "ADDRESS" | "NAME";
      distanceMeters?: number;
    }> = [];

    stops.forEach((stop) => {
      let best: (typeof visits)[number] | null = null;

      customers.forEach((customer) => {
        const customerLat = Number(customer.latitude);
        const customerLon = Number(customer.longitude);
        const hasCustomerCoords = Number.isFinite(customerLat) && Number.isFinite(customerLon);
        const customerDistanceMeters = hasCustomerCoords
          ? this.haversineKm(stop.latitude, stop.longitude, customerLat, customerLon) * 1000
          : undefined;
        const customerGpsMatch = customerDistanceMeters !== undefined && customerDistanceMeters <= matchRadiusMeters;
        const addressScore = this.matchesText(stop.address, customer.address);
        if (customerGpsMatch || addressScore || this.matchesText(stop.address, customer.name)) {
          const candidate = {
            stopIndex: stop.index,
            customerId: customer.id,
            customerName: customer.name,
            customerType: customer.type,
            address: customer.address ?? undefined,
            arrival: stop.arrival,
            departure: stop.departure,
            durationMinutes: stop.durationMinutes,
            match: customerGpsMatch ? "GPS" as const : addressScore ? "ADDRESS" as const : "NAME" as const,
            distanceMeters: customerDistanceMeters === undefined ? undefined : this.roundNumber(customerDistanceMeters, 0),
          };

          if (!best || (candidate.distanceMeters ?? Number.MAX_SAFE_INTEGER) < (best.distanceMeters ?? Number.MAX_SAFE_INTEGER)) {
            best = candidate;
          }
        }

        customer.sites.forEach((site) => {
          const siteLat = Number(site.latitude);
          const siteLon = Number(site.longitude);
          const hasCoords = Number.isFinite(siteLat) && Number.isFinite(siteLon);
          const distanceMeters = hasCoords ? this.haversineKm(stop.latitude, stop.longitude, siteLat, siteLon) * 1000 : undefined;
          const gpsMatch = distanceMeters !== undefined && distanceMeters <= matchRadiusMeters;
          const addressMatch = this.matchesText(stop.address, site.address) || this.matchesText(stop.address, site.name);
          if (!gpsMatch && !addressMatch) {
            return;
          }

          const candidate = {
            stopIndex: stop.index,
            customerId: customer.id,
            customerName: customer.name,
            customerType: customer.type,
            siteId: site.id,
            siteName: site.name,
            address: site.address,
            arrival: stop.arrival,
            departure: stop.departure,
            durationMinutes: stop.durationMinutes,
            match: gpsMatch ? "GPS" as const : "ADDRESS" as const,
            distanceMeters: distanceMeters === undefined ? undefined : this.roundNumber(distanceMeters, 0),
          };

          if (!best || (candidate.distanceMeters ?? Number.MAX_SAFE_INTEGER) < (best.distanceMeters ?? Number.MAX_SAFE_INTEGER)) {
            best = candidate;
          }
        });
      });

      if (best) {
        visits.push(best);
      }
    });

    return visits;
  }

  private detectStops(positions: TraccarPosition[], minStopMinutes: number, speedThresholdKmh: number) {
    const stops: Array<{
      index: number;
      arrival: string;
      departure: string;
      durationMinutes: number;
      latitude: number;
      longitude: number;
      address?: string;
    }> = [];
    let stopStartIndex: number | null = null;

    for (let index = 1; index < positions.length; index += 1) {
      const previous = positions[index - 1];
      const current = positions[index];
      const moving = this.segmentSpeedKmh(previous, current) > speedThresholdKmh;

      if (!moving && stopStartIndex === null) {
        stopStartIndex = index - 1;
      }

      const closesStop = moving || index === positions.length - 1;
      if (stopStartIndex === null || !closesStop) {
        continue;
      }

      const startPosition = positions[stopStartIndex];
      const endPosition = moving ? previous : current;
      const durationMinutes = Math.round((this.positionTime(endPosition).getTime() - this.positionTime(startPosition).getTime()) / 60000);
      if (durationMinutes > minStopMinutes) {
        stops.push({
          index: stops.length,
          arrival: this.positionTime(startPosition).toISOString(),
          departure: this.positionTime(endPosition).toISOString(),
          durationMinutes,
          latitude: startPosition.latitude,
          longitude: startPosition.longitude,
          address: endPosition.address || startPosition.address,
        });
      }

      stopStartIndex = null;
    }

    return stops;
  }

  private calculateMovingDistanceKm(positions: TraccarPosition[]) {
    return positions.reduce((sum, position, index) => {
      if (index === 0) {
        return sum;
      }

      const previous = positions[index - 1];
      if (this.segmentSpeedKmh(previous, position) <= MOVEMENT_SPEED_THRESHOLD_KMH) {
        return sum;
      }

      return sum + this.haversineKm(previous.latitude, previous.longitude, position.latitude, position.longitude);
    }, 0);
  }

  private cleanRoutePositions(positions: TraccarPosition[]) {
    const clean: TraccarPosition[] = [];

    for (const position of positions) {
      if (position.valid === false || position.outdated) {
        continue;
      }

      const accuracy = this.positionAccuracyMeters(position);
      if (accuracy !== null && accuracy > GPS_MAX_ACCURACY_METERS) {
        continue;
      }

      const previous = clean.at(-1);
      if (!previous) {
        clean.push(position);
        continue;
      }

      const deltaMs = this.positionTime(position).getTime() - this.positionTime(previous).getTime();
      if (deltaMs <= 0) {
        continue;
      }

      const distanceMeters = this.haversineKm(previous.latitude, previous.longitude, position.latitude, position.longitude) * 1000;
      if (distanceMeters < GPS_MIN_POINT_DISTANCE_METERS) {
        continue;
      }

      const segmentSpeedKmh = (distanceMeters / 1000 / (deltaMs / 3600000));
      const reportedSpeedKmh = this.positionSpeedKmh(position);
      if (segmentSpeedKmh > GPS_MAX_SEGMENT_SPEED_KMH && reportedSpeedKmh < 90) {
        continue;
      }

      clean.push(position);
    }

    return clean.length >= 2 ? clean : positions;
  }

  private async matchRouteToRoads(positions: TraccarPosition[]): Promise<MatchedRouteResult> {
    const fallbackDistanceKm = this.roundNumber(this.calculateMovingDistanceKm(positions), 2);
    const fallbackRoute = this.serializeRoute(positions);
    const osrmBaseUrl = this.config.get<string>("OSRM_BASE_URL")?.replace(/\/+$/, "");

    if (!osrmBaseUrl || this.config.get<string>("OSRM_MAP_MATCHING") === "false" || positions.length < 2) {
      return { mode: "GPS_FILTERED", engine: "GPS", distanceKm: fallbackDistanceKm, route: fallbackRoute };
    }

    if (osrmBaseUrl.includes("router.project-osrm.org") && this.config.get<string>("OSRM_ALLOW_PUBLIC") !== "true") {
      return {
        mode: "GPS_FILTERED",
        engine: "GPS",
        distanceKm: fallbackDistanceKm,
        route: fallbackRoute,
        message: "Ruta filtrada por GPS. Map matching publico desactivado para proteger ubicaciones reales.",
      };
    }

    const sample = this.sampleRoutePositions(positions, OSRM_MAX_MATCH_POINTS);
    try {
      const matched = await this.matchOsrmRouteChunks(osrmBaseUrl, sample);
      if (matched.coordinates.length < 2) {
        return {
          mode: "GPS_FILTERED",
          engine: "GPS",
          distanceKm: fallbackDistanceKm,
          route: fallbackRoute,
          sampledPoints: sample.length,
          message: matched.message || "Ruta filtrada por GPS. OSRM no pudo ajustar el recorrido a calles.",
        };
      }

      const distanceKm = this.roundNumber(matched.distanceMeters / 1000, 2) || fallbackDistanceKm;
      return {
        mode: "MATCHED",
        engine: "OSRM",
        distanceKm,
        sampledPoints: sample.length,
        matchedPoints: matched.coordinates.length,
        confidence: matched.confidence,
        route: matched.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
        message: `Recorrido ajustado a calles con OSRM privado (${sample.length} puntos GPS -> ${matched.coordinates.length} puntos de ruta).`,
      };
    } catch (error) {
      return {
        mode: "GPS_FILTERED",
        engine: "GPS",
        distanceKm: fallbackDistanceKm,
        route: fallbackRoute,
        sampledPoints: sample.length,
        message: `Ruta filtrada por GPS. No se pudo conectar con OSRM: ${error instanceof Error ? error.message : String(error)}.`,
      };
    }
  }

  private async matchOsrmRouteChunks(baseUrl: string, positions: TraccarPosition[]) {
    const chunks = this.chunkRoutePositions(positions, 85, 8);
    const coordinates: Array<[number, number]> = [];
    let distanceMeters = 0;
    const confidences: number[] = [];
    let lastError = "";

    for (const chunk of chunks) {
      let response = await this.fetchWithTimeout(this.buildOsrmMatchUrl(baseUrl, chunk, true), 10_000);
      if (!response.ok) {
        response = await this.fetchWithTimeout(this.buildOsrmMatchUrl(baseUrl, chunk, false), 10_000);
      }
      if (!response.ok) {
        lastError = `OSRM respondio ${response.status}.`;
        continue;
      }

      const data = (await response.json()) as {
        code?: string;
        matchings?: Array<{
          confidence?: number;
          distance?: number;
          geometry?: { coordinates?: Array<[number, number]> };
        }>;
      };

      if (data.code !== "Ok") {
        lastError = `OSRM devolvio ${data.code || "respuesta invalida"}.`;
        continue;
      }

      for (const matching of data.matchings ?? []) {
        const matchedCoordinates = matching.geometry?.coordinates ?? [];
        if (matchedCoordinates.length < 2) {
          continue;
        }
        distanceMeters += matching.distance ?? 0;
        if (Number.isFinite(matching.confidence)) {
          confidences.push(Number(matching.confidence));
        }

        for (const coordinate of matchedCoordinates) {
          const previous = coordinates.at(-1);
          if (previous && Math.abs(previous[0] - coordinate[0]) < 0.000001 && Math.abs(previous[1] - coordinate[1]) < 0.000001) {
            continue;
          }
          coordinates.push(coordinate);
        }
      }
    }

    return {
      coordinates,
      distanceMeters,
      confidence: confidences.length ? this.roundNumber(confidences.reduce((sum, value) => sum + value, 0) / confidences.length, 3) : null,
      message: lastError,
    };
  }

  private chunkRoutePositions(positions: TraccarPosition[], chunkSize: number, overlap: number) {
    if (positions.length <= chunkSize) {
      return [positions];
    }

    const chunks: TraccarPosition[][] = [];
    const step = Math.max(2, chunkSize - overlap);
    for (let start = 0; start < positions.length; start += step) {
      const chunk = positions.slice(start, start + chunkSize);
      if (chunk.length >= 2) {
        chunks.push(chunk);
      }
      if (start + chunkSize >= positions.length) {
        break;
      }
    }

    return chunks;
  }

  private sampleRoutePositions(positions: TraccarPosition[], maxPoints: number) {
    if (positions.length <= maxPoints) {
      return positions;
    }

    const result: TraccarPosition[] = [];
    const step = (positions.length - 1) / (maxPoints - 1);
    for (let index = 0; index < maxPoints; index += 1) {
      result.push(positions[Math.round(index * step)]);
    }

    return result;
  }

  private buildOsrmMatchUrl(baseUrl: string, positions: TraccarPosition[], includeTimestamps: boolean) {
    const coordinates = positions.map((position) => `${position.longitude},${position.latitude}`).join(";");
    const radiuses = positions.map((position) => Math.max(15, Math.min(this.positionAccuracyMeters(position) ?? 35, 80))).join(";");
    const url = new URL(`${baseUrl}/match/v1/driving/${coordinates}`);
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("overview", "full");
    url.searchParams.set("tidy", "true");
    url.searchParams.set("radiuses", radiuses);
    if (includeTimestamps) {
      url.searchParams.set("timestamps", positions.map((position) => Math.floor(this.positionTime(position).getTime() / 1000)).join(";"));
    }

    return url.toString();
  }

  private serializeRoute(positions: TraccarPosition[]) {
    return positions.map((position) => ({
      time: this.positionTime(position).toISOString(),
      latitude: position.latitude,
      longitude: position.longitude,
      speedKmh: this.roundNumber(this.positionSpeedKmh(position), 1),
      accuracyMeters: this.positionAccuracyMeters(position),
    }));
  }

  private positionAccuracyMeters(position: TraccarPosition) {
    const raw = position.attributes?.accuracy ?? position.attributes?.hdop ?? position.attributes?.pdop;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  private async fetchWithTimeout(url: string, timeoutMs: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private calculateMovingMinutes(positions: TraccarPosition[], speedThresholdKmh: number) {
    if (positions.length < 2) {
      return 0;
    }

    return positions.reduce((minutes, position, index) => {
      if (index === 0) {
        return minutes;
      }

      const previous = positions[index - 1];
      if (this.segmentSpeedKmh(previous, position) <= speedThresholdKmh) {
        return minutes;
      }

      const deltaMinutes = Math.max(0, (this.positionTime(position).getTime() - this.positionTime(previous).getTime()) / 60000);
      return minutes + deltaMinutes;
    }, 0);
  }

  private calculateSpeedStats(positions: TraccarPosition[], speedThresholdKmh: number) {
    const speeds = positions.map((position) => this.positionSpeedKmh(position));
    const movingSpeeds = speeds.filter((speed) => speed > speedThresholdKmh);

    return {
      minSpeedKmh: this.roundNumber(movingSpeeds.length ? Math.min(...movingSpeeds) : 0, 1),
      averageSpeedKmh: this.roundNumber(movingSpeeds.length ? movingSpeeds.reduce((sum, speed) => sum + speed, 0) / movingSpeeds.length : 0, 1),
      maxSpeedKmh: this.roundNumber(movingSpeeds.length ? Math.max(...movingSpeeds) : 0, 1),
    };
  }

  private segmentSpeedKmh(previous: TraccarPosition, current: TraccarPosition) {
    const rawSpeed = Number(current.speed);
    if (Number.isFinite(rawSpeed)) {
      return rawSpeed * 1.852;
    }

    const minutes = (this.positionTime(current).getTime() - this.positionTime(previous).getTime()) / 60000;
    if (minutes <= 0) {
      return 0;
    }

    const distanceKm = this.haversineKm(previous.latitude, previous.longitude, current.latitude, current.longitude);
    return (distanceKm / minutes) * 60;
  }

  private positionSpeedKmh(position: TraccarPosition) {
    const speed = Number(position.speed);
    return Number.isFinite(speed) ? speed * 1.852 : 0;
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const radius = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRadians(value: number) {
    return (value * Math.PI) / 180;
  }

  private positionTime(position: TraccarPosition) {
    const serverTime = this.parsePositionDate(position.serverTime);
    const fixTime = this.parsePositionDate(position.fixTime);
    const deviceTime = this.parsePositionDate(position.deviceTime);
    const gpsTime = fixTime ?? deviceTime;

    if (serverTime && gpsTime) {
      const driftMs = Math.abs(gpsTime.getTime() - serverTime.getTime());
      if (driftMs > 30 * 60 * 1000) {
        return serverTime;
      }
    }

    return gpsTime ?? serverTime ?? new Date();
  }

  private parsePositionDate(value?: string | null) {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toNullableNumber(value: unknown) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  private toNullableBoolean(value: unknown) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "on", "yes"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "off", "no"].includes(normalized)) {
        return false;
      }
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    return null;
  }

  private matchesText(left?: string | null, right?: string | null) {
    const a = this.normalizeText(left);
    const b = this.normalizeText(right);
    return Boolean(a && b && (a.includes(b) || b.includes(a)));
  }

  private resolveCoordinates(latitude?: Prisma.Decimal | number | null, longitude?: Prisma.Decimal | number | null, address?: string | null) {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon };
    }

    return this.parseCoordinatesFromText(address);
  }

  private parseCoordinatesFromText(value?: string | null) {
    const match = value?.match(/(-?\d{1,2}(?:[.,]\d+)?)[,\s]+(-?\d{1,3}(?:[.,]\d+)?)/);
    if (!match) {
      return null;
    }

    const latitude = Number(match[1].replace(",", "."));
    const longitude = Number(match[2].replace(",", "."));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  }

  private normalizeText(value?: string | null) {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  private parseReportDate(date?: string) {
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Date(`${date}T12:00:00-03:00`);
    }

    return new Date();
  }

  private reportRange(date?: string) {
    const dayKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : this.montevideoDateKey(new Date());
    const [year, month, day] = dayKey.split("-").map(Number);
    const from = new Date(Date.UTC(year, month - 1, day, MONTEVIDEO_UTC_OFFSET_HOURS, 0, 0, 0));
    const to = new Date(Date.UTC(year, month - 1, day + 1, MONTEVIDEO_UTC_OFFSET_HOURS, 0, 0, 0) - 1);
    return { from, to, dayKey };
  }

  private montevideoDateKey(date: Date) {
    return date.toLocaleDateString("en-CA", { timeZone: "America/Montevideo" });
  }

  private emptyDailySummary(vehicle: unknown, date?: string, message = "") {
    const day = this.parseReportDate(date);
    return {
      vehicle,
      date: day.toISOString().slice(0, 10),
      configured: false,
      positions: 0,
      distanceKm: 0,
      movingMinutes: 0,
      stoppedMinutes: 0,
      maxSpeedKmh: 0,
      minSpeedKmh: 0,
      averageSpeedKmh: 0,
      estimatedLiters: 0,
      fuelPricePerLiter: 0,
      estimatedFuelCost: 0,
      stops: [],
      visits: [],
      unmatchedStops: [],
      message,
    };
  }

  private roundNumber(value: number, decimals: number) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }

  private async ensureExists(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id }, select: { id: true } });
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }
  }

  private async ensureVehicleExpenseCustomer() {
    const existing =
      (await this.prisma.customer.findFirst({
        where: {
          OR: [
            { name: { equals: "Security Solutions - Operativo", mode: "insensitive" } },
            { name: { equals: "Security Solutions", mode: "insensitive" } },
          ],
        },
        select: { id: true },
      })) ??
      (await this.prisma.customer.findFirst({
        where: { type: "INTERNAL" },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }));

    if (existing) {
      return existing;
    }

    return this.prisma.customer.create({
      data: {
        reference: await this.nextCustomerReference(),
        name: "Security Solutions - Operativo",
        type: "INTERNAL",
        status: "ACTIVE",
        notes: "Entidad interna creada para gastos automaticos de vehiculos y operacion.",
      },
      select: { id: true },
    });
  }

  private async nextCustomerReference() {
    const latest = await this.prisma.customer.findFirst({
      where: { reference: { startsWith: "CLI-" } },
      orderBy: { reference: "desc" },
      select: { reference: true },
    });
    const latestNumber = Number(latest?.reference.replace("CLI-", "") ?? "0");
    const nextNumber = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;
    return `CLI-${String(nextNumber).padStart(4, "0")}`;
  }

  private paymentInclude() {
    return {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          type: true,
        },
      },
      quote: { select: { id: true, number: true, title: true, total: true } },
      workOrder: { select: { id: true, title: true, status: true } },
      vehicle: { select: { id: true, name: true, plate: true } },
      inventoryItem: { select: { id: true, reference: true, sku: true, name: true, unit: true, stock: true, sourceType: true } },
      inventoryMovements: {
        select: {
          id: true,
          type: true,
          quantity: true,
          stockAfter: true,
          unitCost: true,
          totalCost: true,
          currency: true,
          createdAt: true,
          item: { select: { id: true, name: true, sku: true, unit: true } },
        },
      },
    } satisfies Prisma.PaymentInclude;
  }

  private cleanOptional(value?: string) {
    const clean = value?.trim();
    return clean ? clean : undefined;
  }

  private cleanNullable(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const clean = value.trim();
    return clean ? clean : null;
  }

  private normalizeCompanyCoordinates(latitude?: number, longitude?: number) {
    const normalizedLatitude = this.normalizeCoordinate(latitude, "latitude");
    const normalizedLongitude = this.normalizeCoordinate(longitude, "longitude");

    if ((normalizedLatitude === undefined) !== (normalizedLongitude === undefined)) {
      throw new BadRequestException("Carga latitud y longitud de la base operativa.");
    }

    if (
      normalizedLatitude !== undefined &&
      normalizedLongitude !== undefined &&
      !this.isUruguayCoordinate(normalizedLatitude, normalizedLongitude)
    ) {
      throw new BadRequestException("Las coordenadas de la base no parecen estar en Uruguay. Usa latitud -34.xxxxxx y longitud -56.xxxxxx.");
    }

    return {
      latitude: normalizedLatitude,
      longitude: normalizedLongitude,
    };
  }

  private normalizeCoordinate(value: number | undefined, kind: "latitude" | "longitude") {
    if (value === undefined || value === null || value === 0) {
      return undefined;
    }

    const normalized = this.normalizePackedUruguayCoordinate(value, kind);
    const isLatitude = kind === "latitude";
    const valid = isLatitude
      ? normalized >= -90 && normalized <= 90
      : normalized >= -180 && normalized <= 180;

    if (!Number.isFinite(normalized) || !valid) {
      throw new BadRequestException(
        isLatitude
          ? "Latitud invalida. Para Uruguay usa un valor similar a -34.870204."
          : "Longitud invalida. Para Uruguay usa un valor similar a -56.113255.",
      );
    }

    return normalized;
  }

  private normalizePackedUruguayCoordinate(value: number, kind: "latitude" | "longitude") {
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

  private isUruguayCoordinate(latitude: number, longitude: number) {
    return latitude >= -35.2 && latitude <= -30 && longitude >= -58.6 && longitude <= -53;
  }
}
