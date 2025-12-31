import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Battery, Wrench, AlertTriangle } from 'lucide-react';
import type { MaintenanceStats } from '../utils/aggregators';

interface DashboardStatsProps {
  totalBatteries: number;
  maintenanceStats: MaintenanceStats;
}

export function DashboardStats({ totalBatteries, maintenanceStats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Batteries Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Baterías</CardTitle>
          <Battery className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBatteries}</div>
          <p className="text-xs text-slate-500 mt-1">
            Baterías en el sistema
          </p>
        </CardContent>
      </Card>

      {/* Total Maintenances Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mantenimientos Totales</CardTitle>
          <Wrench className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{maintenanceStats.totalMaintenances}</div>
          <p className="text-xs text-slate-500 mt-1">
            Promedio: {maintenanceStats.averageMaintenancePerBattery.toFixed(1)} por batería
          </p>
        </CardContent>
      </Card>

      {/* Batteries Needing Attention Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requieren Atención</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {maintenanceStats.batteriesNeedingMaintenance}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Baterías con salud Fair o menor
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
