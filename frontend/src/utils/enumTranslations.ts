import {
  BatteryStatus,
  MaintenanceType,
  HealthStatus,
  BatteryRemovalReason,
} from '@/api/types/enums';

// Traducciones de estado de batería
export const batteryStatusLabels: Record<BatteryStatus, string> = {
  [BatteryStatus.New]: 'Nueva',
  [BatteryStatus.Installed]: 'Instalada',
  [BatteryStatus.Removed]: 'Removida',
  [BatteryStatus.Disposed]: 'Desechada',
};

// Traducciones de tipo de mantenimiento
export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  [MaintenanceType.Charging]: 'Carga',
  [MaintenanceType.Inspection]: 'Inspección',
  [MaintenanceType.VoltageTest]: 'Prueba de Voltaje',
  [MaintenanceType.LoadTest]: 'Prueba de Carga',
};

// Traducciones de estado de salud
export const healthStatusLabels: Record<HealthStatus, string> = {
  [HealthStatus.Excellent]: 'Excelente',
  [HealthStatus.Good]: 'Bueno',
  [HealthStatus.Fair]: 'Regular',
  [HealthStatus.Poor]: 'Pobre',
  [HealthStatus.Critical]: 'Crítico',
};

// Traducciones de razón de remoción
export const removalReasonLabels: Record<BatteryRemovalReason, string> = {
  [BatteryRemovalReason.EndOfLife]: 'Fin de Vida Útil',
  [BatteryRemovalReason.Defective]: 'Defectuosa',
  [BatteryRemovalReason.Upgrade]: 'Mejora',
  [BatteryRemovalReason.VehicleSold]: 'Vehículo Vendido',
};

// Colores para estados de batería (Tailwind)
export const batteryStatusColors: Record<BatteryStatus, string> = {
  [BatteryStatus.New]: 'bg-blue-100 text-blue-800 border-blue-200',
  [BatteryStatus.Installed]: 'bg-green-100 text-green-800 border-green-200',
  [BatteryStatus.Removed]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [BatteryStatus.Disposed]: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Colores para estados de salud (Tailwind)
export const healthStatusColors: Record<HealthStatus, string> = {
  [HealthStatus.Excellent]: 'bg-green-100 text-green-800 border-green-300',
  [HealthStatus.Good]: 'bg-green-50 text-green-700 border-green-200',
  [HealthStatus.Fair]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [HealthStatus.Poor]: 'bg-orange-100 text-orange-800 border-orange-200',
  [HealthStatus.Critical]: 'bg-red-100 text-red-800 border-red-300',
};
