import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeBattery } from '@/api/batteries.api';
import type { RemoveBatteryRequest } from '@/api/types';

export function useRemoveBattery(batteryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RemoveBatteryRequest) => removeBattery(batteryId, request),
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['battery', batteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    },
  });
}
