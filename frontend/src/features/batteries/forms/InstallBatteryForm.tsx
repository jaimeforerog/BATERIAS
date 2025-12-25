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
      initialVoltage: undefined,
      installedBy: '',
    } as any,
  });

  const handleEquipoSelect = (equipo: Equipo) => {
    setValue('equipoId', equipo.id);
    setValue('equipoCodigo', `EQ-${equipo.id.toString().padStart(3, '0')}`);
    setValue('equipoPlaca', equipo.placa);
    setValue('equipoDescripcion', equipo.descripcion);
  };

  const handleBatterySelect = (battery: Battery) => {
    setValue('batteryId', battery.id);
    setValue('serialNumber', battery.serialNumber);
    setValue('model', battery.model);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">
                  Número de Serie
                </Label>
                <Input
                  id="serialNumber"
                  {...register('serialNumber')}
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
                  {...register('model')}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipoPlaca">Placa</Label>
                <Input
                  id="equipoPlaca"
                  {...register('equipoPlaca')}
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
                  {...register('equipoCodigo')}
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
                {...register('equipoDescripcion')}
                readOnly
                className="bg-slate-50"
                aria-invalid={!!errors.equipoDescripcion}
              />
              {errors.equipoDescripcion && (
                <p className="text-sm text-red-600">{errors.equipoDescripcion.message}</p>
              )}
            </div>

            {/* Hidden field for equipoId */}
            <input type="hidden" {...register('equipoId', { valueAsNumber: true })} />
          </div>

          {/* Installation Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Información de Instalación</h3>

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
