import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disposeBattery } from '@/api/batteries.api';
import type { DisposeBatteryRequest } from '@/api/types';

export function useDisposeBattery(batteryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DisposeBatteryRequest) => disposeBattery(batteryId, request),
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['battery', batteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    },
  });
}
