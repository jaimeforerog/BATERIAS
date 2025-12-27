import { MaintenanceType, HealthStatus, BatteryRemovalReason } from './enums';

// Request para registrar una batería en el inventario
export interface RegisterBatteryRequest {
  batteryId?: string;  // Opcional, se genera si no se proporciona
  serialNumber: string;
  model: string;
  brand: string;
  registrationDate: string; // ISO string 
  registeredBy: string;
}

// Request para instalar una batería
export interface InstallBatteryRequest {
  batteryId?: string;  // Opcional, se genera si no se proporciona
  serialNumber: string;
  model: string;
  equipoId: number;
  equipoCodigo: string;
  equipoPlaca: string;  // Placa del equipo
  equipoDescripcion: string;  // Descripción del equipo
  installationDate: string;  // ISO string
  initialVoltage: number;
  installedBy: string;
}

// Request para registrar mantenimiento
export interface RecordMaintenanceRequest {
  maintenanceDate: string;  // ISO string
  type: MaintenanceType;
  voltageReading: number;
  healthStatus: HealthStatus;
  notes: string;
  performedBy: string;
}

// Request para reemplazar batería
export interface ReplaceBatteryRequest {
  oldBatteryId: string;
  newBatteryId?: string;  // Opcional, se genera si no se proporciona
  newBatterySerialNumber: string;
  newBatteryModel: string;
  equipoId: number;
  equipoCodigo: string;
  reason: BatteryRemovalReason;
  newBatteryInitialVoltage: number;
  replacedBy: string;
}

// Request para remover batería
export interface RemoveBatteryRequest {
  reason: BatteryRemovalReason;
  notes: string;
  removedBy: string;
}

// Request para desechar batería
export interface DisposeBatteryRequest {
  disposalDate: string; // ISO String
  disposalReason: string;
  notes: string;
  disposedBy: string;
}
