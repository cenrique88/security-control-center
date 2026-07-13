export declare class CreateVehicleDto {
    name: string;
    plate?: string;
    make?: string;
    model?: string;
    color?: string;
    colorHex?: string;
    icon?: string;
    logoUrl?: string;
    traccarDeviceId?: string;
    fuelKmPerLiter?: number;
    active?: boolean;
    monitoringPhones?: string;
    monitoringEmails?: string;
    clientShareUrl?: string;
    gpsMonitoringEnabled?: boolean;
    gpsWhatsappAlerts?: boolean;
    gpsEmailAlerts?: boolean;
    gpsEngineCommandsEnabled?: boolean;
    gpsAutoEngineStopOnAlarm?: boolean;
    gpsCommandTextChannel?: boolean;
    gpsStatusCommand?: string;
    gpsEngineStopCommand?: string;
    gpsEngineResumeCommand?: string;
}
