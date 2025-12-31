import { useState } from 'react';
import { useAuditEvents } from '../hooks/useAuditEvents';
import { AuditFilters } from '../components/AuditFilters';
import { ExportButtons } from '../components/ExportButtons';
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
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { AuditFilters as AuditFiltersType } from '../types/audit.types';

const PAGE_SIZE = 10;

export default function AuditReportPage() {
  const [filters, setFilters] = useState<AuditFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useAuditEvents(filters, currentPage, PAGE_SIZE);

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
              <CardTitle className="text-red-900">Error al cargar auditoría</CardTitle>
              <CardDescription className="text-red-700">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const handleFiltersChange = (newFilters: AuditFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const totalPages = data?.totalPages || 0;
  const totalCount = data?.totalCount || 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Registro de Auditoría</h1>
            </div>
            <p className="text-slate-600">
              Historial completo de eventos del sistema - {totalCount} registros encontrados
            </p>
          </div>
          <ExportButtons filters={filters} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <AuditFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Results Table */}
        {!data || data.events.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No se encontraron eventos</CardTitle>
              <CardDescription>
                Ajusta los filtros para mostrar diferentes resultados.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Serie</TableHead>
                    <TableHead>Realizado Por</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Voltaje</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.events.map((event) => (
                    <TableRow key={event.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm">
                        {format(new Date(event.eventTimestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {translateEventType(event.eventType)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{event.serialNumber || '-'}</TableCell>
                      <TableCell>{event.performedBy}</TableCell>
                      <TableCell>{event.equipoCodigo || '-'}</TableCell>
                      <TableCell>
                        {event.voltageReading ? `${event.voltageReading.toFixed(2)}V` : '-'}
                      </TableCell>
                      <TableCell className="max-w-md truncate" title={event.eventDescription}>
                        {event.eventDescription}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500">
                  Página {currentPage} de {totalPages} ({totalCount} registros totales)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
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
    </div>
  );
}

function translateEventType(eventType: string): string {
  const translations: Record<string, string> = {
    BatteryRegistered: 'Registrada',
    BatteryInstalled: 'Instalada',
    MaintenanceRecorded: 'Mantenimiento',
    BatteryRemoved: 'Removida',
    BatteryReplaced: 'Reemplazada',
    BatteryDisposed: 'Desechada',
  };
  return translations[eventType] || eventType;
}
