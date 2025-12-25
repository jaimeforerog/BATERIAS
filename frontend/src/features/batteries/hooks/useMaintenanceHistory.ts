import { useQuery } from '@tanstack/react-query';
import { getMaintenanceHistory } from '@/api/batteries.api';

export function useMaintenanceHistory(batteryId: string) {
  return useQuery({
    queryKey: ['maintenance-history', batteryId],
    queryFn: () => getMaintenanceHistory(batteryId),
    staleTime: 30000,
    enabled: !!batteryId,
  });
}
