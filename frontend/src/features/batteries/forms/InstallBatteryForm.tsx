import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { installBatterySchema, type InstallBatteryFormData } from '../schemas/installBattery.schema';
import { EquipoSearch } from '../components/EquipoSearch';
import { BatterySearch } from '../components/BatterySearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Equipo } from '@/types/equipo';
import type { Battery } from '@/types/battery';

interface InstallBatteryFormProps {
  onSubmit: (data: InstallBatteryFormData) => void;
  isSubmitting?: boolean;
  initialSerialNumber?: string;
  initialModel?: string;
}

export function InstallBatteryForm({
  onSubmit,
  isSubmitting = false,
  initialSerialNumber,
  initialModel
}: InstallBatteryFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InstallBatteryFormData>({
    resolver: zodResolver(installBatterySchema),
    defaultValues: {
      batteryId: undefined, // Added batteryId
      serialNumber: initialSerialNumber || '',
      model: initialModel || '',
      equipoId: undefined,
      equipoCodigo: '',
      equipoPlaca: '',
      equipoDescripcion: '',
      installationDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      initialVoltage: undefined,
      installedBy: '',
    } as any,
  });

  // Watch form values to sync with readonly inputs
  const serialNumber = watch('serialNumber');
  const model = watch('model');
  const equipoPlaca = watch('equipoPlaca');
  const equipoCodigo = watch('equipoCodigo');
  const equipoDescripcion = watch('equipoDescripcion');

  const handleEquipoSelect = (equipo: Equipo) => {
    setValue('equipoId', equipo.id, { shouldValidate: true, shouldDirty: true });
    setValue('equipoCodigo', `EQ-${equipo.id.toString().padStart(3, '0')}`, { shouldValidate: true, shouldDirty: true });
    setValue('equipoPlaca', equipo.placa, { shouldValidate: true, shouldDirty: true });
    setValue('equipoDescripcion', equipo.descripcion, { shouldValidate: true, shouldDirty: true });
  };

  const handleBatterySelect = (battery: Battery) => {
    setValue('batteryId', battery.id, { shouldValidate: true, shouldDirty: true });
    setValue('serialNumber', battery.serialNumber, { shouldValidate: true, shouldDirty: true });
    setValue('model', battery.model, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instalar Nueva Batería</CardTitle>
        <CardDescription>
          Complete los datos de la batería y el equipo donde será instalada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Battery Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Información de la Batería</h3>

            <BatterySearch
              onSelect={handleBatterySelect}
              error={errors.batteryId?.message}
            />

            <input type="hidden" {...register('batteryId')} />
            <input type="hidden" {...register('serialNumber')} />
            <input type="hidden" {...register('model')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">
                  Número de Serie
                </Label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  readOnly
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">
                  Modelo
                </Label>
                <Input
                  id="model"
                  value={model}
                  readOnly
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialVoltage">
                Voltaje Inicial (V) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="initialVoltage"
                type="number"
                step="0.01"
                placeholder="Ej: 12.6"
                {...register('initialVoltage', { valueAsNumber: true })}
                aria-invalid={!!errors.initialVoltage}
              />
              {errors.initialVoltage && (
                <p className="text-sm text-red-600">{errors.initialVoltage.message}</p>
              )}
            </div>
          </div>

          {/* Equipment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Información del Equipo</h3>

            <EquipoSearch
              onSelect={handleEquipoSelect}
              error={errors.equipoId?.message}
            />

            <input type="hidden" {...register('equipoId', { valueAsNumber: true })} />
            <input type="hidden" {...register('equipoCodigo')} />
            <input type="hidden" {...register('equipoPlaca')} />
            <input type="hidden" {...register('equipoDescripcion')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipoPlaca">Placa</Label>
                <Input
                  id="equipoPlaca"
                  value={equipoPlaca}
                  readOnly
                  className="bg-slate-50"
                  aria-invalid={!!errors.equipoPlaca}
                />
                {errors.equipoPlaca && (
                  <p className="text-sm text-red-600">{errors.equipoPlaca.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipoCodigo">Código</Label>
                <Input
                  id="equipoCodigo"
                  value={equipoCodigo}
                  readOnly
                  className="bg-slate-50"
                  aria-invalid={!!errors.equipoCodigo}
                />
                {errors.equipoCodigo && (
                  <p className="text-sm text-red-600">{errors.equipoCodigo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipoDescripcion">Descripción</Label>
              <Input
                id="equipoDescripcion"
                value={equipoDescripcion}
                readOnly
                className="bg-slate-50"
                aria-invalid={!!errors.equipoDescripcion}
              />
              {errors.equipoDescripcion && (
                <p className="text-sm text-red-600">{errors.equipoDescripcion.message}</p>
              )}
            </div>
          </div>

          {/* Installation Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Información de Instalación</h3>

            <div className="space-y-2">
              <Label htmlFor="installationDate">
                Fecha de Instalación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="installationDate"
                type="date"
                {...register('installationDate')}
                aria-invalid={!!errors.installationDate}
              />
              {errors.installationDate && (
                <p className="text-sm text-red-600">{errors.installationDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installedBy">
                Instalado Por <span className="text-red-500">*</span>
              </Label>
              <Input
                id="installedBy"
                placeholder="Nombre del técnico"
                {...register('installedBy')}
                aria-invalid={!!errors.installedBy}
              />
              {errors.installedBy && (
                <p className="text-sm text-red-600">{errors.installedBy.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none"
            >
              {isSubmitting ? 'Instalando...' : 'Instalar Batería'}
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
