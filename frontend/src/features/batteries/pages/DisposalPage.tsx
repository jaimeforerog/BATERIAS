import { useParams, useNavigate } from 'react-router-dom';
import { useBattery } from '../hooks/useBattery';
import { useDisposeBattery } from '../hooks/useDisposeBattery';
import { DisposalForm } from '../forms/DisposalForm';
import type { DisposalFormData } from '../schemas/disposal.schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatteryStatus } from '@/api/types';

export default function DisposalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: battery, isLoading } = useBattery(id!);
  const disposeBatteryMutation = useDisposeBattery(id!);

  const handleSubmit = async (data: DisposalFormData) => {
    try {
      await disposeBatteryMutation.mutateAsync(data);

      // Navigate back to battery detail
      navigate(`/batteries/${id}`, {
        state: {
          message: 'Batería desechada exitosamente'
        }
      });
    } catch (error) {
      console.error('Error disposing battery:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (!battery) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Batería no encontrada</CardTitle>
              <CardDescription className="text-red-700">
                No se pudo encontrar la batería especificada
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (battery.status !== BatteryStatus.Removed) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Operación no permitida</CardTitle>
              <CardDescription className="text-yellow-700">
                Solo se pueden desechar baterías que han sido removidas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Desechar Batería</h1>
          <p className="text-slate-600 mt-2">
            Registra el desecho de la batería removida
          </p>
        </div>

        {disposeBatteryMutation.isError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al desechar batería</CardTitle>
              <CardDescription className="text-red-700">
                {disposeBatteryMutation.error instanceof Error
                  ? disposeBatteryMutation.error.message
                  : 'Ha ocurrido un error desconocido. Por favor, intenta nuevamente.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <DisposalForm
          batteryId={battery.id}
          batterySerialNumber={battery.serialNumber}
          onSubmit={handleSubmit}
          isSubmitting={disposeBatteryMutation.isPending}
        />
      </div>
    </div>
  );
}
