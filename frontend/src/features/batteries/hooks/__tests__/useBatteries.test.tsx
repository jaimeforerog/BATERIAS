import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBatteries } from '../useBatteries';
import * as batteriesApi from '@/api/batteries.api';
import { BatteryStatus } from '@/api/types/enums';
import type { BatteryStatusProjection } from '@/api/types/responses';

// Mock the batteries API
vi.mock('@/api/batteries.api');

describe('useBatteries', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  const mockBatteries: BatteryStatusProjection[] = [
    {
      id: 'battery-1',
      serialNumber: 'BAT-001',
      model: 'Model X',
      brand: 'BrandY',
      brandId: 1,
      brandName: 'Bosch',
      brandCategory: 'Premium Internacional',
      registrationDate: '2025-01-01T00:00:00Z',
      status: BatteryStatus.Installed,
      currentEquipoId: 101,
      equipoCodigo: 'EQ-101',
      installationDate: '2025-01-02T00:00:00Z',
      lastVoltageReading: 12.6,
      currentHealthStatus: 0, // Excellent
      lastMaintenanceDate: '2025-01-10T00:00:00Z',
      maintenanceCount: 2,
    },
    {
      id: 'battery-2',
      serialNumber: 'BAT-002',
      model: 'Model Y',
      brand: 'BrandZ',
      brandId: 2,
      brandName: 'Varta',
      brandCategory: 'Premium Internacional',
      registrationDate: '2025-01-05T00:00:00Z',
      status: BatteryStatus.New,
      currentEquipoId: null,
      equipoCodigo: null,
      installationDate: null,
      lastVoltageReading: null,
      currentHealthStatus: null,
      lastMaintenanceDate: null,
      maintenanceCount: 0,
    },
  ];

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

  it('should fetch all batteries when no status filter is provided', async () => {
    vi.mocked(batteriesApi.getBatteries).mockResolvedValue(mockBatteries);

    const { result } = renderHook(() => useBatteries(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(batteriesApi.getBatteries).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockBatteries);
    expect(result.current.data).toHaveLength(2);
  });

  it('should fetch batteries filtered by status when status is provided', async () => {
    const installedBatteries = [mockBatteries[0]];
    vi.mocked(batteriesApi.getBatteries).mockResolvedValue(installedBatteries);

    const { result } = renderHook(() => useBatteries(BatteryStatus.Installed), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(batteriesApi.getBatteries).toHaveBeenCalledWith(BatteryStatus.Installed);
    expect(result.current.data).toEqual(installedBatteries);
    expect(result.current.data).toHaveLength(1);
  });

  it('should handle loading state correctly', () => {
    vi.mocked(batteriesApi.getBatteries).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useBatteries(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state correctly', async () => {
    const error = new Error('Failed to fetch batteries');
    vi.mocked(batteriesApi.getBatteries).mockRejectedValue(error);

    const { result } = renderHook(() => useBatteries(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeUndefined();
  });

  it('should use correct query key for caching', async () => {
    vi.mocked(batteriesApi.getBatteries).mockResolvedValue(mockBatteries);

    const { result } = renderHook(() => useBatteries(BatteryStatus.New), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cachedData = queryClient.getQueryData(['batteries', BatteryStatus.New]);
    expect(cachedData).toEqual(mockBatteries);
  });

  it('should return empty array when no batteries exist', async () => {
    vi.mocked(batteriesApi.getBatteries).mockResolvedValue([]);

    const { result } = renderHook(() => useBatteries(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(result.current.data).toHaveLength(0);
  });
});
