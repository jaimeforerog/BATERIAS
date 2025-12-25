import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBattery } from '../hooks/useBattery';
import { useRemoveBattery } from '../hooks/useRemoveBattery';
import { RemovalForm } from '../forms/RemovalForm';
import type { RemovalFormData } from '../schemas/removal.schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatteryStatus } from '@/api/types';

export default function RemovalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: battery, isLoading, refetch } = useBattery(id!);
  const removeBatteryMutation = useRemoveBattery(id!);

  // Refetch battery data when component mounts to ensure fresh data
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSubmit = async (data: RemovalFormData) => {
    try {
      await removeBatteryMutation.mutateAsync(data);

      // Navigate back to battery detail
      navigate(`/batteries/${id}`, {
        state: {
          message: 'Batería removida exitosamente'
        }
      });
    } catch (error) {
      console.error('Error removing battery:', error);
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

  if (battery.status !== BatteryStatus.Installed) {
    const statusMessages = {
      [BatteryStatus.New]: 'Esta batería aún no ha sido instalada',
      [BatteryStatus.Removed]: 'Esta batería ya fue removida anteriormente',
      [BatteryStatus.Disposed]: 'Esta batería ya fue desechada',
    };

    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Operación no permitida</CardTitle>
              <CardDescription className="text-yellow-700">
                Solo se pueden remover baterías que estén instaladas.<br />
                {statusMessages[battery.status] || 'Estado de batería inválido'}
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded hover:bg-slate-300"
            >
              Volver a la lista
            </button>
            <button
              onClick={() => navigate(`/batteries/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver detalle de batería
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Remover Batería</h1>
          <p className="text-slate-600 mt-2">
            Registra la remoción de la batería del equipo
          </p>
        </div>

        {removeBatteryMutation.isError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al remover batería</CardTitle>
              <CardDescription className="text-red-700">
                {removeBatteryMutation.error instanceof Error
                  ? removeBatteryMutation.error.message
                  : 'Ha ocurrido un error desconocido. Por favor, intenta nuevamente.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <RemovalForm
          batteryId={battery.id}
          batterySerialNumber={battery.serialNumber}
          onSubmit={handleSubmit}
          isSubmitting={removeBatteryMutation.isPending}
        />
      </div>
    </div>
  );
}
