import apiClient from './client';

export interface HealthCheckEntry {
  name: string;
  status: string;
  description: string | null;
  duration: string;
  exception: string | null;
  data: Record<string, object>;
  tags: string[];
}

export interface HealthCheckResponse {
  status: string;
  totalDuration: string;
  entries: Record<string, HealthCheckEntry>;
}

export async function getHealthCheck(): Promise<HealthCheckResponse> {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
}

export async function getReadinessCheck(): Promise<{ status: number }> {
  try {
    const response = await apiClient.get('/health/ready');
    return { status: response.status };
  } catch (error) {
    return { status: 503 };
  }
}

export async function getLivenessCheck(): Promise<{ status: number }> {
  try {
    const response = await apiClient.get('/health/live');
    return { status: response.status };
  } catch (error) {
    return { status: 503 };
  }
}
