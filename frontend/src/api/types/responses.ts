import { BatteryStatus, HealthStatus, MaintenanceType, BatteryRemovalReason } from './enums';

// Proyección del estado actual de una batería
export interface BatteryStatusProjection {
  id: string;
  serialNumber: string;
  model: string;
  brand: string;
  registrationDate: string; // ISO Date
  status: BatteryStatus;
  currentEquipoId: number | null;
  equipoCodigo: string | null;
  installationDate: string | null;
  lastVoltageReading: number | null;
  currentHealthStatus: HealthStatus | null;
  lastMaintenanceDate: string | null;
  maintenanceCount: number;
}

// Proyección del historial de mantenimiento
export interface MaintenanceHistoryProjection {
  id: string;
  batteryId: string;
  maintenanceDate: string;
  type: MaintenanceType;
  voltageReading: number;
  healthStatus: HealthStatus;
  notes: string;
  performedBy: string;
}

// Entry de historial de batería
export interface BatteryHistoryEntry {
  batteryId: string;
  serialNumber: string;
  installedDate: string;
  removedDate: string | null;
  removalReason: BatteryRemovalReason | null;
}

// Proyección de batería desde perspectiva del equipo
export interface EquipoBatteryProjection {
  id: number;  // EquipoId
  equipoCodigo: string;
  currentBatteryId: string | null;
  currentBatterySerialNumber: string | null;
  currentBatteryInstallDate: string | null;
  batteryHistory: BatteryHistoryEntry[];
}

// Respuesta de eventos (para debugging)
export interface BatteryEventResponse {
  eventType: string;
  timestamp: string;
  version: number;
  data: unknown;
}

// Respuestas de comandos
export interface RegisterBatteryResponse {
  batteryId: string;
}

export interface InstallBatteryResponse {
  batteryId: string;
}

export interface ReplaceBatteryResponse {
  newBatteryId: string;
}
