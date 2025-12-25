import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordMaintenance } from '@/api/batteries.api';
import type { RecordMaintenanceRequest } from '@/api/types';

export function useRecordMaintenance(batteryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordMaintenanceRequest) => recordMaintenance(batteryId, request),
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['battery', batteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-history', batteryId] });
    },
  });
}
