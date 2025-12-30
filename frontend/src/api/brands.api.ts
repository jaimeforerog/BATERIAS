import apiClient from './client';

export interface BatteryBrand {
  id: number;
  name: string;
  category: string;
}

/**
 * Obtiene todas las marcas de baterías disponibles
 */
export const getBrands = async (): Promise<BatteryBrand[]> => {
  const response = await apiClient.get<BatteryBrand[]>('/api/battery-brands');
  return response.data;
};
