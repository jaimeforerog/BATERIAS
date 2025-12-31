import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadBatteriesReport } from '@/api/reports.api';
import { useBatteries } from '../hooks/useBatteries';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthStatusBadge } from '@/components/shared/HealthStatusBadge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateShort, formatVoltage } from '@/utils/formatters';
import { batteryStatusLabels } from '@/utils/enumTranslations';
import { BatteryStatus } from '@/api/types';
import { Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function BatteriesListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<BatteryStatus | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Get filtered batteries based on status
  const { data: batteries, isLoading, error } = useBatteries(statusFilter);

  // Get total batteries count (without filter) for header display
  const { data: allBatteries } = useBatteries(undefined);

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
              <CardTitle className="text-red-900">Error al cargar baterías</CardTitle>
              <CardDescription className="text-red-700">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Pagination Logic
  const totalItems = batteries?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBatteries = batteries?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await downloadBatteriesReport();
      // Éxito: el archivo se descargó automáticamente
      console.log('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert(
        error instanceof Error
          ? `Error al exportar: ${error.message}`
          : 'Error al exportar el reporte. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Control de Baterías</h1>
            <p className="text-slate-600 mt-2">
              Sistema de gestión de baterías - {allBatteries?.length || 0} baterías en total
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2"
              disabled={isExporting}
            >
              <Download className={`h-4 w-4 ${isExporting ? 'opacity-50' : ''}`} />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
            <Button onClick={() => navigate('/batteries/register')} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Batería
            </Button>
            <Button onClick={() => navigate('/batteries/install')} className="gap-2">
              <Plus className="h-4 w-4" />
              Instalar Batería
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={statusFilter === undefined ? 'default' : 'outline'}
            onClick={() => { setStatusFilter(undefined); setCurrentPage(1); }}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={statusFilter === BatteryStatus.New ? 'default' : 'outline'}
            onClick={() => { setStatusFilter(BatteryStatus.New); setCurrentPage(1); }}
            size="sm"
          >
            {batteryStatusLabels[BatteryStatus.New]}
          </Button>
          <Button
            variant={statusFilter === BatteryStatus.Installed ? 'default' : 'outline'}
            onClick={() => { setStatusFilter(BatteryStatus.Installed); setCurrentPage(1); }}
            size="sm"
          >
            {batteryStatusLabels[BatteryStatus.Installed]}
          </Button>
          <Button
            variant={statusFilter === BatteryStatus.Removed ? 'default' : 'outline'}
            onClick={() => { setStatusFilter(BatteryStatus.Removed); setCurrentPage(1); }}
            size="sm"
          >
            {batteryStatusLabels[BatteryStatus.Removed]}
          </Button>
          <Button
            variant={statusFilter === BatteryStatus.Disposed ? 'default' : 'outline'}
            onClick={() => { setStatusFilter(BatteryStatus.Disposed); setCurrentPage(1); }}
            size="sm"
          >
            {batteryStatusLabels[BatteryStatus.Disposed]}
          </Button>
        </div>

        {!batteries || batteries.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay baterías registradas</CardTitle>
              <CardDescription>
                Comienza instalando una batería en un equipo.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serie / Modelo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Registrada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Voltaje</TableHead>
                    <TableHead>Salud</TableHead>
                    <TableHead>Mantenimientos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBatteries.map((battery) => (
                    <TableRow key={battery.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <button
                            onClick={() => navigate(`/batteries/${battery.id}`)}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {battery.serialNumber}
                          </button>
                          <span className="text-xs text-slate-500">{battery.model}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {battery.brandName || '-'}
                      </TableCell>
                      <TableCell>
                        {/* Use registrationDate if available, formatted */}
                        {battery.registrationDate ? formatDateShort(battery.registrationDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={battery.status} />
                      </TableCell>
                      <TableCell>
                        {battery.currentEquipoId ? (
                          <div className="flex flex-col">
                            <span className="font-medium">#{battery.currentEquipoId}</span>
                            <span className="text-xs text-slate-500">{battery.equipoCodigo}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {battery.lastVoltageReading !== null ? formatVoltage(battery.lastVoltageReading) : '-'}
                      </TableCell>
                      <TableCell>
                        {battery.currentHealthStatus !== null ? (
                          <HealthStatusBadge status={battery.currentHealthStatus} />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {battery.maintenanceCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} baterías
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
}
