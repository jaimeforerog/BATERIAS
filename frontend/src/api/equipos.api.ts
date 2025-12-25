import apiClient from './client';
import type { EquipoBatteryProjection } from './types/responses';

// Queries (GET)

export const getEquipoBattery = async (equipoId: number): Promise<EquipoBatteryProjection> => {
  const response = await apiClient.get<EquipoBatteryProjection>(`/api/equipos/${equipoId}/bateria`);
  return response.data;
};
