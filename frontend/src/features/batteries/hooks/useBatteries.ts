import { useQuery } from '@tanstack/react-query';
import { getBatteries } from '@/api/batteries.api';
import type { BatteryStatus } from '@/api/types/enums';

export function useBatteries(status?: BatteryStatus) {
  return useQuery({
    queryKey: ['batteries', status],
    queryFn: () => getBatteries(status),
    staleTime: 30000, // 30 segundos
  });
}
