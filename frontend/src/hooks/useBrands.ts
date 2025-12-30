import { useQuery } from '@tanstack/react-query';
import { getBrands } from '@/api/brands.api';

/**
 * Hook para obtener la lista de marcas de baterías disponibles
 * Las marcas se cachean indefinidamente ya que raramente cambian
 */
export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: Infinity, // Las marcas raramente cambian
  });
}
