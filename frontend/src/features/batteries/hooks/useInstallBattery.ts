import { useMutation } from '@tanstack/react-query';
import { installBattery } from '@/api/batteries.api';
import type { InstallBatteryRequest } from '@/api/types';

export function useInstallBattery() {
  return useMutation({
    mutationFn: (request: InstallBatteryRequest) => installBattery(request),
  });
}
