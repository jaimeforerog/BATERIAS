import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { disposalSchema, type DisposalFormData } from '../schemas/disposal.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DisposalFormProps {
  batteryId: string;
  batterySerialNumber: string;
  onSubmit: (data: DisposalFormData) => void;
  isSubmitting?: boolean;
}

export function DisposalForm({
  batteryId,
  batterySerialNumber,
  onSubmit,
  isSubmitting = false
}: DisposalFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DisposalFormData>({
    resolver: zodResolver(disposalSchema),
    defaultValues: {
      disposalDate: new Date().toISOString().split('T')[0],
      disposalReason: '',
      notes: '',
      disposedBy: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desechar Batería</CardTitle>
        <CardDescription>
          Batería: {batterySerialNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Disposal Date */}
          <div className="space-y-2">
            <Label htmlFor="disposalDate">
              Fecha de Desecho <span className="text-red-500">*</span>
            </Label>
            <Input
              id="disposalDate"
              type="date"
              {...register('disposalDate')}
              aria-invalid={!!errors.disposalDate}
            />
            {errors.disposalDate && (
              <p className="text-sm text-red-600">{errors.disposalDate.message}</p>
            )}
          </div>
          {/* Disposal Reason */}
          <div className="space-y-2">
            <Label htmlFor="disposalReason">
              Razón de Desecho <span className="text-red-500">*</span>
            </Label>
            <Input
              id="disposalReason"
              placeholder="Ej: Fin de vida útil, batería defectuosa..."
              {...register('disposalReason')}
              aria-invalid={!!errors.disposalReason}
            />
            {errors.disposalReason && (
              <p className="text-sm text-red-600">{errors.disposalReason.message}</p>
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
              placeholder="Describe el estado de la batería y el proceso de desecho..."
              {...register('notes')}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Disposed By */}
          <div className="space-y-2">
            <Label htmlFor="disposedBy">
              Desechado Por <span className="text-red-500">*</span>
            </Label>
            <Input
              id="disposedBy"
              placeholder="Nombre del responsable"
              {...register('disposedBy')}
              aria-invalid={!!errors.disposedBy}
            />
            {errors.disposedBy && (
              <p className="text-sm text-red-600">{errors.disposedBy.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none"
            >
              {isSubmitting ? 'Guardando...' : 'Desechar Batería'}
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
