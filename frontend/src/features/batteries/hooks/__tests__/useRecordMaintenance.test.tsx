import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecordMaintenance } from '../useRecordMaintenance';
import * as batteriesApi from '@/api/batteries.api';
import { MaintenanceType, HealthStatus } from '@/api/types/enums';
import type { RecordMaintenanceRequest } from '@/api/types/requests';

// Mock the batteries API
vi.mock('@/api/batteries.api');

describe('useRecordMaintenance', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  const batteryId = 'battery-123';

  const testMaintenanceData: RecordMaintenanceRequest = {
    maintenanceDate: '2025-01-15T10:00:00Z',
    type: MaintenanceType.Inspection,
    voltageReading: 12.4,
    healthStatus: HealthStatus.Good,
    notes: 'Regular inspection completed',
    performedBy: 'Technician John',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  it('should call recordMaintenance API when mutateAsync is called', async () => {
    vi.mocked(batteriesApi.recordMaintenance).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    await result.current.mutateAsync(testMaintenanceData);

    expect(batteriesApi.recordMaintenance).toHaveBeenCalledWith(batteryId, testMaintenanceData);
  });

  it('should invalidate relevant queries on success', async () => {
    vi.mocked(batteriesApi.recordMaintenance).mockResolvedValue(undefined);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    await result.current.mutateAsync(testMaintenanceData);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['battery', batteryId] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['batteries'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['maintenance-history', batteryId] });
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(3);
  });

  it('should handle pending state correctly', async () => {
    vi.mocked(batteriesApi.recordMaintenance).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    const mutationPromise = result.current.mutateAsync(testMaintenanceData);

    // Wait for pending state to become true
    await waitFor(() => expect(result.current.isPending).toBe(true));

    await mutationPromise;

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it('should handle error state correctly', async () => {
    const error = new Error('Failed to record maintenance');
    vi.mocked(batteriesApi.recordMaintenance).mockRejectedValue(error);

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    await expect(result.current.mutateAsync(testMaintenanceData)).rejects.toThrow(
      'Failed to record maintenance'
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });

  it('should handle different maintenance types correctly', async () => {
    vi.mocked(batteriesApi.recordMaintenance).mockResolvedValue(undefined);

    const maintenanceTypes = [
      MaintenanceType.Charging,
      MaintenanceType.Inspection,
      MaintenanceType.VoltageTest,
      MaintenanceType.LoadTest,
    ];

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    for (const type of maintenanceTypes) {
      const data: RecordMaintenanceRequest = {
        ...testMaintenanceData,
        type,
      };

      await result.current.mutateAsync(data);

      expect(batteriesApi.recordMaintenance).toHaveBeenCalledWith(batteryId, data);
    }

    expect(batteriesApi.recordMaintenance).toHaveBeenCalledTimes(maintenanceTypes.length);
  });

  it('should handle different health status values correctly', async () => {
    vi.mocked(batteriesApi.recordMaintenance).mockResolvedValue(undefined);

    const healthStatuses = [
      HealthStatus.Excellent,
      HealthStatus.Good,
      HealthStatus.Fair,
      HealthStatus.Poor,
      HealthStatus.Critical,
    ];

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    for (const healthStatus of healthStatuses) {
      const data: RecordMaintenanceRequest = {
        ...testMaintenanceData,
        healthStatus,
      };

      await result.current.mutateAsync(data);

      expect(batteriesApi.recordMaintenance).toHaveBeenCalledWith(batteryId, data);
    }

    expect(batteriesApi.recordMaintenance).toHaveBeenCalledTimes(healthStatuses.length);
  });

  it('should allow recording multiple maintenance records sequentially', async () => {
    vi.mocked(batteriesApi.recordMaintenance).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordMaintenance(batteryId), { wrapper });

    const maintenance1: RecordMaintenanceRequest = {
      maintenanceDate: '2025-01-10T10:00:00Z',
      type: MaintenanceType.Charging,
      voltageReading: 12.0,
      healthStatus: HealthStatus.Fair,
      notes: 'Battery charged',
      performedBy: 'Tech 1',
    };

    const maintenance2: RecordMaintenanceRequest = {
      maintenanceDate: '2025-01-15T10:00:00Z',
      type: MaintenanceType.VoltageTest,
      voltageReading: 12.6,
      healthStatus: HealthStatus.Good,
      notes: 'Voltage test passed',
      performedBy: 'Tech 2',
    };

    await result.current.mutateAsync(maintenance1);
    await result.current.mutateAsync(maintenance2);

    expect(batteriesApi.recordMaintenance).toHaveBeenCalledTimes(2);
    expect(batteriesApi.recordMaintenance).toHaveBeenNthCalledWith(1, batteryId, maintenance1);
    expect(batteriesApi.recordMaintenance).toHaveBeenNthCalledWith(2, batteryId, maintenance2);
  });
});
