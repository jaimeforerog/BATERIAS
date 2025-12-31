import apiClient from './client';
import type { AuditEventResponse, AuditFilters } from '@/features/audit/types/audit.types';

export const getAuditEvents = async (
  filters: AuditFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<AuditEventResponse> => {
  const params: Record<string, any> = { page, pageSize };

  if (filters.startDate) {
    params.startDate = filters.startDate.toISOString();
  }
  if (filters.endDate) {
    params.endDate = filters.endDate.toISOString();
  }
  if (filters.performedBy) {
    params.performedBy = filters.performedBy;
  }
  if (filters.serialNumber) {
    params.serialNumber = filters.serialNumber;
  }
  if (filters.eventType) {
    params.eventType = filters.eventType;
  }

  const response = await apiClient.get<AuditEventResponse>('/api/audit/events', { params });
  return response.data;
};

export const downloadAuditExcel = async (filters: AuditFilters): Promise<void> => {
  const params: Record<string, any> = {};

  if (filters.startDate) params.startDate = filters.startDate.toISOString();
  if (filters.endDate) params.endDate = filters.endDate.toISOString();
  if (filters.performedBy) params.performedBy = filters.performedBy;
  if (filters.serialNumber) params.serialNumber = filters.serialNumber;
  if (filters.eventType) params.eventType = filters.eventType;

  const response = await apiClient.get('/api/audit/events/export/excel', {
    params,
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Auditoria_Baterias_${new Date().toISOString().slice(0, 10)}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadAuditCSV = async (filters: AuditFilters): Promise<void> => {
  const params: Record<string, any> = {};

  if (filters.startDate) params.startDate = filters.startDate.toISOString();
  if (filters.endDate) params.endDate = filters.endDate.toISOString();
  if (filters.performedBy) params.performedBy = filters.performedBy;
  if (filters.serialNumber) params.serialNumber = filters.serialNumber;
  if (filters.eventType) params.eventType = filters.eventType;

  const response = await apiClient.get('/api/audit/events/export/csv', {
    params,
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Auditoria_Baterias_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
