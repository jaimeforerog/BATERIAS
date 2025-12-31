import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardStats } from '../components/DashboardStats';
import { StatusDistributionChart } from '../components/StatusDistributionChart';
import { HealthDistributionChart } from '../components/HealthDistributionChart';
import { BrandDistributionChart } from '../components/BrandDistributionChart';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al cargar el dashboard</CardTitle>
              <CardDescription className="text-red-700">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No hay datos disponibles</CardTitle>
              <CardDescription>
                No se encontraron baterías en el sistema.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Baterías</h1>
          <p className="text-slate-600 mt-2">
            Resumen y estadísticas del sistema de gestión de baterías
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats
          totalBatteries={data.totalBatteries}
          maintenanceStats={data.maintenanceStats}
        />

        {/* Charts Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusDistributionChart data={data.statusDistribution} />
          <HealthDistributionChart data={data.healthDistribution} />
        </div>

        {/* Brand Chart - Full width */}
        <BrandDistributionChart data={data.brandDistribution} />
      </div>
    </div>
  );
}
