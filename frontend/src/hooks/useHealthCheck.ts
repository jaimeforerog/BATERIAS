import { useQuery } from '@tanstack/react-query';
import { getHealthCheck, type HealthCheckResponse } from '@/api/monitoring.api';

export function useHealthCheck(refetchInterval: number = 30000) {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: getHealthCheck,
    refetchInterval, // Refetch every 30 seconds by default
    retry: 3,
    retryDelay: 1000,
  });
}
