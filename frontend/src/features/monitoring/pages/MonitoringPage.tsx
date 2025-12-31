import { useHealthCheck } from '@/hooks/useHealthCheck';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Activity, Database, Server } from 'lucide-react';

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'healthy':
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    case 'unhealthy':
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return <AlertCircle className="h-6 w-6 text-gray-500" />;
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'degraded':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'unhealthy':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export default function MonitoringPage() {
  const { data: healthData, isLoading, error, dataUpdatedAt } = useHealthCheck(10000); // Refetch every 10 seconds

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cargando estado del sistema...</h1>
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
              <CardTitle className="text-red-900 flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Error al conectar con el servidor
              </CardTitle>
              <CardDescription className="text-red-700">
                No se pudo obtener el estado del sistema. Verifique que la API esté en funcionamiento.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const lastUpdate = new Date(dataUpdatedAt);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="h-8 w-8" />
            Monitoreo del Sistema
          </h1>
          <p className="text-slate-600 mt-2">
            Estado en tiempo real de los servicios del sistema de gestión de baterías
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Última actualización: {lastUpdate.toLocaleString()}
          </p>
        </div>

        {/* Overall Status Card */}
        <Card className={`border-2 ${getStatusColor(healthData?.status || 'unknown')}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(healthData?.status || 'unknown')}
                <div>
                  <CardTitle className="text-2xl">
                    Estado General: {healthData?.status}
                  </CardTitle>
                  <CardDescription>
                    Tiempo total de respuesta: {healthData?.totalDuration || 'N/A'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Individual Service Checks */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Estado de Servicios</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {healthData?.entries && Object.entries(healthData.entries).map(([key, entry]) => (
              <Card key={key} className={`border ${getStatusColor(entry.status)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {key.toLowerCase().includes('postgresql') || key.toLowerCase().includes('database') ? (
                          <Database className="h-5 w-5" />
                        ) : (
                          <Server className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg capitalize">{key}</CardTitle>
                        {entry.description && (
                          <CardDescription className="mt-1">
                            {entry.description}
                          </CardDescription>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(entry.status)}
                            <span className="font-semibold">{entry.status}</span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Duración: {entry.duration}
                          </p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-2">
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {entry.exception && (
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm font-mono text-red-800">{entry.exception}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Información del Monitoreo</CardTitle>
            <CardDescription className="text-blue-700">
              Esta página se actualiza automáticamente cada 10 segundos para mostrar el estado actual del sistema.
              Los health checks verifican la conectividad con la base de datos PostgreSQL y otros servicios críticos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
