import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInstallBattery } from '../useInstallBattery';
import * as batteriesApi from '@/api/batteries.api';
import React from 'react';

// Mock the API
vi.mock('@/api/batteries.api', () => ({
  installBattery: vi.fn(),
}));

describe('useInstallBattery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call installBattery API when mutateAsync is called', async () => {
    const mockResponse = { batteryId: 'test-id-123' };
    vi.mocked(batteriesApi.installBattery).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useInstallBattery(), { wrapper });

    const testData = {
      batteryId: 'test-id',
      serialNumber: 'BAT-001',
      model: 'ModelX',
      equipoId: 101,
      equipoCodigo: 'EQ-101',
      equipoPlaca: 'ABC123',
      equipoDescripcion: 'Test Equipment',
      installationDate: '2025-01-01',
      initialVoltage: 12.6,
      installedBy: 'Technician',
    };

    await result.current.mutateAsync(testData);

    expect(batteriesApi.installBattery).toHaveBeenCalledWith(testData);
  });

  it('should return response data on successful mutation', async () => {
    const mockResponse = { batteryId: 'battery-123' };
    vi.mocked(batteriesApi.installBattery).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useInstallBattery(), { wrapper });

    const testData = {
      batteryId: 'test-id',
      serialNumber: 'BAT-001',
      model: 'ModelX',
      equipoId: 101,
      equipoCodigo: 'EQ-101',
      equipoPlaca: 'ABC123',
      equipoDescripcion: 'Test Equipment',
      installationDate: '2025-01-01',
      initialVoltage: 12.6,
      installedBy: 'Technician',
    };

    const response = await result.current.mutateAsync(testData);

    expect(response).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Installation failed';
    vi.mocked(batteriesApi.installBattery).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useInstallBattery(), { wrapper });

    const testData = {
      batteryId: 'test-id',
      serialNumber: 'BAT-001',
      model: 'ModelX',
      equipoId: 101,
      equipoCodigo: 'EQ-101',
      equipoPlaca: 'ABC123',
      equipoDescripcion: 'Test Equipment',
      installationDate: '2025-01-01',
      initialVoltage: 12.6,
      installedBy: 'Technician',
    };

    await expect(result.current.mutateAsync(testData)).rejects.toThrow(errorMessage);
  });

  it('should update isPending state during mutation', async () => {
    vi.mocked(batteriesApi.installBattery).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ batteryId: '123' }), 100))
    );

    const { result } = renderHook(() => useInstallBattery(), { wrapper });

    const testData = {
      batteryId: 'test-id',
      serialNumber: 'BAT-001',
      model: 'ModelX',
      equipoId: 101,
      equipoCodigo: 'EQ-101',
      equipoPlaca: 'ABC123',
      equipoDescripcion: 'Test Equipment',
      installationDate: '2025-01-01',
      initialVoltage: 12.6,
      installedBy: 'Technician',
    };

    // Start mutation
    const promise = result.current.mutateAsync(testData);

    // Should be pending
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Wait for completion
    await promise;

    // Should no longer be pending
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
