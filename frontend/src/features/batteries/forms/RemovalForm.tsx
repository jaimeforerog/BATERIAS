import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { removalSchema, type RemovalFormData } from '../schemas/removal.schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatteryRemovalReason } from '@/api/types';
import { removalReasonLabels } from '@/utils/enumTranslations';

interface RemovalFormProps {
  batteryId: string;
  batterySerialNumber: string;
  onSubmit: (data: RemovalFormData) => void;
  isSubmitting?: boolean;
}

export function RemovalForm({
  batteryId: _batteryId,
  batterySerialNumber,
  onSubmit,
  isSubmitting = false
}: RemovalFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RemovalFormData>({
    resolver: zodResolver(removalSchema),
    defaultValues: {
      reason: undefined,
      notes: '',
      removedBy: '',
    } as any,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remover Batería</CardTitle>
        <CardDescription>
          Batería: {batterySerialNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Removal Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Razón de Remoción <span className="text-red-500">*</span>
            </Label>
            <select
              id="reason"
              {...register('reason', {
                setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
              })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.reason}
            >
              <option value="">Selecciona una razón</option>
              <option value={BatteryRemovalReason.EndOfLife}>{removalReasonLabels[BatteryRemovalReason.EndOfLife]}</option>
              <option value={BatteryRemovalReason.Defective}>{removalReasonLabels[BatteryRemovalReason.Defective]}</option>
              <option value={BatteryRemovalReason.Upgrade}>{removalReasonLabels[BatteryRemovalReason.Upgrade]}</option>
              <option value={BatteryRemovalReason.VehicleSold}>{removalReasonLabels[BatteryRemovalReason.VehicleSold]}</option>
            </select>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
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
              placeholder="Describe la razón de la remoción y el estado de la batería..."
              {...register('notes')}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Removed By */}
          <div className="space-y-2">
            <Label htmlFor="removedBy">
              Removido Por <span className="text-red-500">*</span>
            </Label>
            <input
              id="removedBy"
              placeholder="Nombre del técnico"
              {...register('removedBy')}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={!!errors.removedBy}
            />
            {errors.removedBy && (
              <p className="text-sm text-red-600">{errors.removedBy.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="destructive"
              className="flex-1 md:flex-none"
            >
              {isSubmitting ? 'Guardando...' : 'Remover Batería'}
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
