import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { maintenanceSchema, type MaintenanceFormData } from '../schemas/maintenance.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceType, HealthStatus } from '@/api/types';
import { maintenanceTypeLabels, healthStatusLabels } from '@/utils/enumTranslations';

interface MaintenanceFormProps {
  batteryId: string;
  batterySerialNumber: string;
  onSubmit: (data: MaintenanceFormData) => void;
  isSubmitting?: boolean;
}

export function MaintenanceForm({
  batteryId,
  batterySerialNumber,
  onSubmit,
  isSubmitting = false
}: MaintenanceFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: undefined,
      voltageReading: undefined,
      healthStatus: undefined,
      notes: '',
      performedBy: '',
    } as any,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Mantenimiento</CardTitle>
        <CardDescription>
          Batería: {batterySerialNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Maintenance Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Tipo de Mantenimiento <span className="text-red-500">*</span>
            </Label>
            <select
              id="type"
              {...register('type', {
                setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
              })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.type}
            >
              <option value="">Selecciona un tipo</option>
              <option value={MaintenanceType.Charging}>{maintenanceTypeLabels[MaintenanceType.Charging]}</option>
              <option value={MaintenanceType.Inspection}>{maintenanceTypeLabels[MaintenanceType.Inspection]}</option>
              <option value={MaintenanceType.VoltageTest}>{maintenanceTypeLabels[MaintenanceType.VoltageTest]}</option>
              <option value={MaintenanceType.LoadTest}>{maintenanceTypeLabels[MaintenanceType.LoadTest]}</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Voltage Reading */}
          <div className="space-y-2">
            <Label htmlFor="voltageReading">
              Lectura de Voltaje (V) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="voltageReading"
              type="number"
              step="0.01"
              placeholder="Ej: 12.4"
              {...register('voltageReading', { valueAsNumber: true })}
              aria-invalid={!!errors.voltageReading}
            />
            {errors.voltageReading && (
              <p className="text-sm text-red-600">{errors.voltageReading.message}</p>
            )}
          </div>

          {/* Health Status */}
          <div className="space-y-2">
            <Label htmlFor="healthStatus">
              Estado de Salud <span className="text-red-500">*</span>
            </Label>
            <select
              id="healthStatus"
              {...register('healthStatus', {
                setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
              })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.healthStatus}
            >
              <option value="">Selecciona el estado</option>
              <option value={HealthStatus.Excellent}>{healthStatusLabels[HealthStatus.Excellent]}</option>
              <option value={HealthStatus.Good}>{healthStatusLabels[HealthStatus.Good]}</option>
              <option value={HealthStatus.Fair}>{healthStatusLabels[HealthStatus.Fair]}</option>
              <option value={HealthStatus.Poor}>{healthStatusLabels[HealthStatus.Poor]}</option>
              <option value={HealthStatus.Critical}>{healthStatusLabels[HealthStatus.Critical]}</option>
            </select>
            {errors.healthStatus && (
              <p className="text-sm text-red-600">{errors.healthStatus.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Observaciones <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Describe el mantenimiento realizado..."
              {...register('notes')}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Performed By */}
          <div className="space-y-2">
            <Label htmlFor="performedBy">
              Realizado Por <span className="text-red-500">*</span>
            </Label>
            <Input
              id="performedBy"
              placeholder="Nombre del técnico"
              {...register('performedBy')}
              aria-invalid={!!errors.performedBy}
            />
            {errors.performedBy && (
              <p className="text-sm text-red-600">{errors.performedBy.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Mantenimiento'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="flex-1 md:flex-none"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
