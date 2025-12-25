// Enums que coinciden exactamente con el backend
// Usando objetos con as const para compatibilidad con erasableSyntaxOnly

export const BatteryStatus = {
  New: 0,
  Installed: 1,
  Removed: 2,
  Disposed: 3
} as const;

export type BatteryStatus = typeof BatteryStatus[keyof typeof BatteryStatus];

export const MaintenanceType = {
  Charging: 0,
  Inspection: 1,
  VoltageTest: 2,
  LoadTest: 3
} as const;

export type MaintenanceType = typeof MaintenanceType[keyof typeof MaintenanceType];

export const HealthStatus = {
  Excellent: 0,
  Good: 1,
  Fair: 2,
  Poor: 3,
  Critical: 4
} as const;

export type HealthStatus = typeof HealthStatus[keyof typeof HealthStatus];

export const BatteryRemovalReason = {
  EndOfLife: 0,
  Defective: 1,
  Upgrade: 2,
  VehicleSold: 3
} as const;

export type BatteryRemovalReason = typeof BatteryRemovalReason[keyof typeof BatteryRemovalReason];
