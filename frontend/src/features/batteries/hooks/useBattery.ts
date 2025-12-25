import { useQuery } from '@tanstack/react-query';
import { getBattery } from '@/api/batteries.api';

export function useBattery(id: string) {
  return useQuery({
    queryKey: ['battery', id],
    queryFn: () => getBattery(id),
    staleTime: 30000,
    enabled: !!id,
  });
}
