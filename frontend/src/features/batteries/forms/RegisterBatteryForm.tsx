import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { registerBatterySchema, type RegisterBatteryFormData } from '../schemas/registerBattery.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RegisterBatteryFormProps {
  onSubmit: (data: RegisterBatteryFormData) => void;
  isSubmitting?: boolean;
}

export function RegisterBatteryForm({
  onSubmit,
  isSubmitting = false,
}: RegisterBatteryFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBatteryFormData>({
    resolver: zodResolver(registerBatterySchema),
    defaultValues: {
      serialNumber: '',
      model: '',
      brand: '',
      registrationDate: new Date().toISOString().split('T')[0], // Today's date
      registeredBy: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Nueva Batería</CardTitle>
        <CardDescription>
          Registra una batería en el inventario sin asignarla a un equipo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Battery Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Información de la Batería</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">
                  Número de Serie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="serialNumber"
                  placeholder="Ej: BAT-2024-001"
                  {...register('serialNumber')}
                  aria-invalid={!!errors.serialNumber}
                />
                {errors.serialNumber && (
                  <p className="text-sm text-red-600">{errors.serialNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">
                  Marca <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brand"
                  placeholder="Ej: Trojan"
                  {...register('brand')}
                  aria-invalid={!!errors.brand}
                />
                {errors.brand && (
                  <p className="text-sm text-red-600">{errors.brand.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">
                  Modelo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  placeholder="Ej: T-105"
                  {...register('model')}
                  aria-invalid={!!errors.model}
                />
                {errors.model && (
                  <p className="text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDate">
                  Fecha de Registro <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationDate"
                  type="date"
                  {...register('registrationDate')}
                  aria-invalid={!!errors.registrationDate}
                />
                {errors.registrationDate && (
                  <p className="text-sm text-red-600">{errors.registrationDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registeredBy">
                Registrado Por <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registeredBy"
                placeholder="Nombre de quien registra"
                {...register('registeredBy')}
                aria-invalid={!!errors.registeredBy}
              />
              {errors.registeredBy && (
                <p className="text-sm text-red-600">{errors.registeredBy.message}</p>
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
              {isSubmitting ? 'Registrando...' : 'Registrar Batería'}
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
