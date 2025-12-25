import { useMutation, useQueryClient } from '@tanstack/react-query';
import { installBattery } from '@/api/batteries.api';
import type { InstallBatteryRequest } from '@/api/types';

export function useInstallBattery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InstallBatteryRequest) => installBattery(request),
    onSuccess: () => {
      // Invalidate batteries queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    },
  });
}
