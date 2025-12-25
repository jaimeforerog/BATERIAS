import apiClient from './client';
import type {
  BatteryStatusProjection,
  MaintenanceHistoryProjection,
  BatteryEventResponse,
  RegisterBatteryResponse,
  InstallBatteryResponse,
  ReplaceBatteryResponse,
} from './types/responses';
import type {
  RegisterBatteryRequest,
  InstallBatteryRequest,
  RecordMaintenanceRequest,
  ReplaceBatteryRequest,
  RemoveBatteryRequest,
  DisposeBatteryRequest,
} from './types/requests';
import type { BatteryStatus } from './types/enums';

// Queries (GET)

export const getBatteries = async (status?: BatteryStatus): Promise<BatteryStatusProjection[]> => {
  const params = status !== undefined ? { status } : {};
  const response = await apiClient.get<BatteryStatusProjection[]>('/api/batteries', { params });
  return response.data;
};

export const getBattery = async (id: string): Promise<BatteryStatusProjection> => {
  const response = await apiClient.get<BatteryStatusProjection>(`/api/batteries/${id}`);
  return response.data;
};

export const getMaintenanceHistory = async (batteryId: string): Promise<MaintenanceHistoryProjection[]> => {
  const response = await apiClient.get<MaintenanceHistoryProjection[]>(
    `/api/batteries/${batteryId}/maintenance-history`
  );
  return response.data;
};

export const getBatteryEvents = async (batteryId: string): Promise<BatteryEventResponse[]> => {
  const response = await apiClient.get<BatteryEventResponse[]>(`/api/batteries/${batteryId}/events`);
  return response.data;
};

// Commands (POST)

export const registerBattery = async (request: RegisterBatteryRequest): Promise<RegisterBatteryResponse> => {
  const response = await apiClient.post<RegisterBatteryResponse>('/api/batteries/register', request);
  return response.data;
};

export const installBattery = async (request: InstallBatteryRequest): Promise<InstallBatteryResponse> => {
  const response = await apiClient.post<InstallBatteryResponse>('/api/batteries/install', request);
  return response.data;
};

export const recordMaintenance = async (
  batteryId: string,
  request: RecordMaintenanceRequest
): Promise<void> => {
  await apiClient.post(`/api/batteries/${batteryId}/maintenance`, request);
};

export const replaceBattery = async (request: ReplaceBatteryRequest): Promise<ReplaceBatteryResponse> => {
  const response = await apiClient.post<ReplaceBatteryResponse>('/api/batteries/replace', request);
  return response.data;
};

export const removeBattery = async (
  batteryId: string,
  request: RemoveBatteryRequest
): Promise<void> => {
  await apiClient.post(`/api/batteries/${batteryId}/remove`, request);
};

export const disposeBattery = async (
  batteryId: string,
  request: DisposeBatteryRequest
): Promise<void> => {
  await apiClient.post(`/api/batteries/${batteryId}/dispose`, request);
};
