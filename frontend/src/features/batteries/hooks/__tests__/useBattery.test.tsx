import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBattery } from '../useBattery';
import * as batteriesApi from '@/api/batteries.api';
import { BatteryStatus } from '@/api/types/enums';
import type { BatteryStatusProjection } from '@/api/types/responses';

// Mock the batteries API
vi.mock('@/api/batteries.api');

describe('useBattery', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  const mockBattery: BatteryStatusProjection = {
    id: 'battery-123',
    serialNumber: 'BAT-001',
    model: 'Model X',
    brand: 'BrandY',
    registrationDate: '2025-01-01T00:00:00Z',
    status: BatteryStatus.Installed,
    currentEquipoId: 101,
    equipoCodigo: 'EQ-101',
    installationDate: '2025-01-02T00:00:00Z',
    lastVoltageReading: 12.6,
    currentHealthStatus: 0, // Excellent
    lastMaintenanceDate: '2025-01-10T00:00:00Z',
    maintenanceCount: 2,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
  });

  it('should fetch battery by id successfully', async () => {
    vi.mocked(batteriesApi.getBattery).mockResolvedValue(mockBattery);

    const { result } = renderHook(() => useBattery('battery-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(batteriesApi.getBattery).toHaveBeenCalledWith('battery-123');
    expect(result.current.data).toEqual(mockBattery);
  });

  it('should not fetch when id is empty string', () => {
    const { result } = renderHook(() => useBattery(''), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(batteriesApi.getBattery).not.toHaveBeenCalled();
  });

  it('should handle loading state correctly', () => {
    vi.mocked(batteriesApi.getBattery).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useBattery('battery-123'), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state correctly', async () => {
    const error = new Error('Battery not found');
    vi.mocked(batteriesApi.getBattery).mockRejectedValue(error);

    const { result } = renderHook(() => useBattery('battery-123'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key for caching', async () => {
    vi.mocked(batteriesApi.getBattery).mockResolvedValue(mockBattery);

    const { result } = renderHook(() => useBattery('battery-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cachedData = queryClient.getQueryData(['battery', 'battery-123']);
    expect(cachedData).toEqual(mockBattery);
  });

  it('should refetch when battery id changes', async () => {
    const battery1: BatteryStatusProjection = { ...mockBattery, id: 'battery-1', serialNumber: 'BAT-001' };
    const battery2: BatteryStatusProjection = { ...mockBattery, id: 'battery-2', serialNumber: 'BAT-002' };

    vi.mocked(batteriesApi.getBattery)
      .mockResolvedValueOnce(battery1)
      .mockResolvedValueOnce(battery2);

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useBattery(id),
      {
        wrapper,
        initialProps: { id: 'battery-1' },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(battery1);

    rerender({ id: 'battery-2' });

    await waitFor(() => expect(result.current.data).toEqual(battery2));
    expect(batteriesApi.getBattery).toHaveBeenCalledTimes(2);
    expect(batteriesApi.getBattery).toHaveBeenNthCalledWith(1, 'battery-1');
    expect(batteriesApi.getBattery).toHaveBeenNthCalledWith(2, 'battery-2');
  });

  it('should respect staleTime configuration', async () => {
    vi.mocked(batteriesApi.getBattery).mockResolvedValue(mockBattery);

    const { result, rerender } = renderHook(() => useBattery('battery-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // First call
    expect(batteriesApi.getBattery).toHaveBeenCalledTimes(1);

    // Rerender within staleTime window (30 seconds)
    rerender();

    // Should not refetch due to staleTime
    expect(batteriesApi.getBattery).toHaveBeenCalledTimes(1);
  });
});
