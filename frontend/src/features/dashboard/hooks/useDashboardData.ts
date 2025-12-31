import { useMemo } from 'react';
import { useBatteries } from '@/features/batteries/hooks/useBatteries';
import {
  aggregateStatusDistribution,
  aggregateHealthDistribution,
  aggregateBrandDistribution,
  calculateMaintenanceStats,
} from '../utils/aggregators';

export function useDashboardData() {
  const { data: batteries, isLoading, error } = useBatteries();

  const dashboardData = useMemo(() => {
    if (!batteries) return null;

    return {
      totalBatteries: batteries.length,
      statusDistribution: aggregateStatusDistribution(batteries),
      healthDistribution: aggregateHealthDistribution(batteries),
      brandDistribution: aggregateBrandDistribution(batteries),
      maintenanceStats: calculateMaintenanceStats(batteries),
    };
  }, [batteries]);

  return {
    data: dashboardData,
    isLoading,
    error,
  };
}
