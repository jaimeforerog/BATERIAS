import { useParams, useNavigate } from 'react-router-dom';
import { useBattery } from '../hooks/useBattery';
import { useMaintenanceHistory } from '../hooks/useMaintenanceHistory';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthStatusBadge } from '@/components/shared/HealthStatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatVoltage } from '@/utils/formatters';
import { maintenanceTypeLabels } from '@/utils/enumTranslations';
import { ArrowLeft, Calendar, Zap, Activity, Wrench, Plus, Trash2, XCircle } from 'lucide-react';
import { BatteryStatus } from '@/api/types';

export default function BatteryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: battery, isLoading, error } = useBattery(id!);
  const { data: maintenanceHistory, isLoading: isLoadingHistory } = useMaintenanceHistory(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (error || !battery) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al cargar batería</CardTitle>
              <CardDescription className="text-red-700">
                {error instanceof Error ? error.message : 'Batería no encontrada'}
              </CardDescription>
            </CardHeader>
          </Card>
          <Button onClick={() => navigate('/')} className="mt-4" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={() => navigate('/')} variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{battery.serialNumber}</h1>
              <p className="text-slate-600 mt-2">{battery.model}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={battery.status} />
              {battery.status === BatteryStatus.New && (
                <Button
                  onClick={() => navigate('/batteries/install', {
                    state: {
                      serialNumber: battery.serialNumber,
                      model: battery.model
                    }
                  })}
                  size="default"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Instalar en Equipo
                </Button>
              )}
              {battery.status === BatteryStatus.Installed && (
                <>
                  <Button
                    onClick={() => navigate(`/batteries/${id}/maintenance`)}
                    size="default"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Registrar Mantenimiento
                  </Button>
                  <Button
                    onClick={() => navigate(`/batteries/${id}/remove`)}
                    size="default"
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remover Batería
                  </Button>
                </>
              )}
              {battery.status === BatteryStatus.Removed && (
                <Button
                  onClick={() => navigate(`/batteries/${id}/dispose`)}
                  size="default"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Desechar Batería
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Battery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Información de la Batería
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Número de Serie</p>
                <p className="text-lg text-slate-900">{battery.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Modelo</p>
                <p className="text-lg text-slate-900">{battery.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Marca</p>
                <p className="text-lg text-slate-900">{battery.brandName}</p>
                {battery.brandCategory && (
                  <p className="text-xs text-slate-500">{battery.brandCategory}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Fecha de Registro</p>
                <p className="text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  {formatDate(battery.registrationDate)}
                </p>
              </div>
              {battery.lastVoltageReading !== null && (
                <div>
                  <p className="text-sm font-medium text-slate-700">Último Voltaje</p>
                  <p className="text-lg text-slate-900 font-semibold">
                    {formatVoltage(battery.lastVoltageReading)}
                  </p>
                </div>
              )}
              {battery.currentHealthStatus !== null && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Estado de Salud</p>
                  <HealthStatusBadge status={battery.currentHealthStatus} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Equipo Asignado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {battery.currentEquipoId ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">ID del Equipo</p>
                    <p className="text-lg text-slate-900">{battery.currentEquipoId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Código del Equipo</p>
                    <p className="text-lg text-slate-900">{battery.equipoCodigo}</p>
                  </div>
                  {battery.installationDate && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Fecha de Instalación</p>
                      <p className="text-slate-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {formatDate(battery.installationDate)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-600 italic">No asignada a ningún equipo</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Maintenance History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Historial de Mantenimiento
              </CardTitle>
              <Badge variant="secondary">{battery.maintenanceCount} registros</Badge>
            </div>
            <CardDescription>
              {battery.lastMaintenanceDate
                ? `Último mantenimiento: ${formatDate(battery.lastMaintenanceDate)}`
                : 'Sin registros de mantenimiento'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <p className="text-slate-600">Cargando historial...</p>
            ) : !maintenanceHistory || maintenanceHistory.length === 0 ? (
              <p className="text-slate-600 italic">No hay registros de mantenimiento</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 text-sm font-semibold text-slate-700">Fecha</th>
                      <th className="pb-3 text-sm font-semibold text-slate-700">Tipo</th>
                      <th className="pb-3 text-sm font-semibold text-slate-700">Voltaje</th>
                      <th className="pb-3 text-sm font-semibold text-slate-700">Estado de Salud</th>
                      <th className="pb-3 text-sm font-semibold text-slate-700">Realizado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {maintenanceHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="py-3 text-sm text-slate-900">
                          {formatDate(record.maintenanceDate)}
                        </td>
                        <td className="py-3 text-sm">
                          <Badge variant="outline">{maintenanceTypeLabels[record.type]}</Badge>
                        </td>
                        <td className="py-3 text-sm font-medium text-slate-900">
                          {formatVoltage(record.voltageReading)}
                        </td>
                        <td className="py-3 text-sm">
                          <HealthStatusBadge status={record.healthStatus} />
                        </td>
                        <td className="py-3 text-sm text-slate-900">{record.performedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
