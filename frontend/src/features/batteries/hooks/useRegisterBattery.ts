import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerBattery } from '@/api/batteries.api';
import type { RegisterBatteryRequest } from '@/api/types';

export function useRegisterBattery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegisterBatteryRequest) => registerBattery(request),
    onSuccess: () => {
      // Invalidate batteries queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    },
  });
}
