import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import type { AuditFilters } from '../types/audit.types';

interface AuditFiltersProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
}

const EVENT_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'BatteryRegistered', label: 'Batería Registrada' },
  { value: 'BatteryInstalled', label: 'Batería Instalada' },
  { value: 'MaintenanceRecorded', label: 'Mantenimiento Registrado' },
  { value: 'BatteryRemoved', label: 'Batería Removida' },
  { value: 'BatteryReplaced', label: 'Batería Reemplazada' },
  { value: 'BatteryDisposed', label: 'Batería Desechada' },
];

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: AuditFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha Inicio</Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate ? localFilters.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value ? new Date(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha Fin</Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate ? localFilters.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value ? new Date(e.target.value) : undefined })}
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Número de Serie</Label>
            <Input
              id="serialNumber"
              type="text"
              placeholder="Buscar por serie..."
              value={localFilters.serialNumber || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, serialNumber: e.target.value })}
            />
          </div>

          {/* Performed By */}
          <div className="space-y-2">
            <Label htmlFor="performedBy">Realizado Por</Label>
            <Input
              id="performedBy"
              type="text"
              placeholder="Nombre del operador..."
              value={localFilters.performedBy || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, performedBy: e.target.value })}
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType">Tipo de Evento</Label>
            <select
              id="eventType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={localFilters.eventType || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, eventType: e.target.value })}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleApplyFilters} className="gap-2">
            <Search className="h-4 w-4" />
            Aplicar Filtros
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
