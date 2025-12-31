import type { BatteryStatusProjection } from '@/api/types/responses';
import { BatteryStatus, HealthStatus } from '@/api/types/enums';
import { batteryStatusLabels, healthStatusLabels } from '@/utils/enumTranslations';

export interface StatusDistribution {
  name: string;
  value: number;
  status: BatteryStatus;
  [key: string]: string | number;
}

export interface HealthDistribution {
  name: string;
  value: number;
  status: HealthStatus;
  [key: string]: string | number;
}

export interface BrandDistribution {
  name: string;
  count: number;
}

export interface MaintenanceStats {
  totalMaintenances: number;
  averageMaintenancePerBattery: number;
  batteriesNeedingMaintenance: number;
}

export function aggregateStatusDistribution(
  batteries: BatteryStatusProjection[]
): StatusDistribution[] {
  const statusCounts = new Map<BatteryStatus, number>();

  batteries.forEach((battery) => {
    const count = statusCounts.get(battery.status) || 0;
    statusCounts.set(battery.status, count + 1);
  });

  return Array.from(statusCounts.entries()).map(([status, value]) => ({
    name: batteryStatusLabels[status],
    value,
    status,
  }));
}

export function aggregateHealthDistribution(
  batteries: BatteryStatusProjection[]
): HealthDistribution[] {
  const healthCounts = new Map<HealthStatus, number>();

  batteries.forEach((battery) => {
    if (battery.currentHealthStatus !== null) {
      const count = healthCounts.get(battery.currentHealthStatus) || 0;
      healthCounts.set(battery.currentHealthStatus, count + 1);
    }
  });

  return Array.from(healthCounts.entries()).map(([status, value]) => ({
    name: healthStatusLabels[status],
    value,
    status,
  }));
}

export function aggregateBrandDistribution(
  batteries: BatteryStatusProjection[]
): BrandDistribution[] {
  const brandCounts = new Map<string, number>();

  batteries.forEach((battery) => {
    const brandName = battery.brandName || 'Sin marca';
    const count = brandCounts.get(brandName) || 0;
    brandCounts.set(brandName, count + 1);
  });

  return Array.from(brandCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 brands
}

export function calculateMaintenanceStats(
  batteries: BatteryStatusProjection[]
): MaintenanceStats {
  const totalMaintenances = batteries.reduce(
    (sum, b) => sum + b.maintenanceCount,
    0
  );
  const averageMaintenancePerBattery =
    batteries.length > 0 ? totalMaintenances / batteries.length : 0;

  const batteriesNeedingMaintenance = batteries.filter(
    (b) =>
      b.currentHealthStatus !== null && b.currentHealthStatus >= HealthStatus.Fair
  ).length;

  return {
    totalMaintenances,
    averageMaintenancePerBattery,
    batteriesNeedingMaintenance,
  };
}
