import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5167';

/**
 * Hook personalizado para conectar al hub de SignalR y actualizar
 * el cache de React Query con eventos en tiempo real
 */
export function useBatteryWebSocket() {
  const queryClient = useQueryClient();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Crear la conexión
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/battery`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Handler para BatteryInstalled
    connection.on('BatteryInstalled', (data: any) => {
      console.log('📡 WS: BatteryInstalled', data);

      // Invalidar queries para que se recarguen con las proyecciones actualizadas
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
      queryClient.invalidateQueries({ queryKey: ['battery', data.BatteryId] });
    });

    // Handler para BatteryRegistered
    connection.on('BatteryRegistered', (data: any) => {
      console.log('📡 WS: BatteryRegistered', data);

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    });

    // Handler para MaintenanceRecorded
    connection.on('MaintenanceRecorded', (data: any) => {
      console.log('📡 WS: MaintenanceRecorded', data);

      // Invalidar queries de la batería específica
      queryClient.invalidateQueries({ queryKey: ['battery', data.BatteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
      queryClient.invalidateQueries({
        queryKey: ['maintenanceHistory', data.BatteryId]
      });
    });

    // Handler para BatteryRemoved
    connection.on('BatteryRemoved', (data: any) => {
      console.log('📡 WS: BatteryRemoved', data);

      queryClient.invalidateQueries({ queryKey: ['battery', data.BatteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    });

    // Handler para BatteryReplaced
    connection.on('BatteryReplaced', (data: any) => {
      console.log('📡 WS: BatteryReplaced', data);

      queryClient.invalidateQueries({ queryKey: ['battery', data.OldBatteryId] });
      queryClient.invalidateQueries({ queryKey: ['battery', data.NewBatteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    });

    // Handler para BatteryDisposed
    connection.on('BatteryDisposed', (data: any) => {
      console.log('📡 WS: BatteryDisposed', data);

      queryClient.invalidateQueries({ queryKey: ['battery', data.BatteryId] });
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
    });

    // Conectar
    connection
      .start()
      .then(() => {
        console.log('✅ Conectado al hub de baterías');
      })
      .catch((err) => {
        console.error('❌ Error conectando al hub de baterías:', err);
      });

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .then(() => console.log('🔌 Desconectado del hub de baterías'))
          .catch((err) => console.error('Error desconectando:', err));
      }
    };
  }, [queryClient]);

  return connectionRef.current;
}
