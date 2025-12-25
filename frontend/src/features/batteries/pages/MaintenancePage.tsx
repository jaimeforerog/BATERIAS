import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useBattery } from '../hooks/useBattery';
import { useRecordMaintenance } from '../hooks/useRecordMaintenance';
import { MaintenanceForm } from '../forms/MaintenanceForm';
import type { MaintenanceFormData } from '../schemas/maintenance.schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: battery, isLoading } = useBattery(id!);
  const recordMaintenanceMutation = useRecordMaintenance(id!);

  const handleSubmit = async (data: MaintenanceFormData) => {
    try {
      // @ts-ignore - Runtime enum values are compatible numbers
      await recordMaintenanceMutation.mutateAsync(data);

      // Navigate back to battery detail
      navigate(`/batteries/${id}`, {
        state: {
          message: 'Mantenimiento registrado exitosamente'
        }
      });
    } catch (error) {
      console.error('Error recording maintenance:', error);
    }
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.data?.error) {
      return error.response.data.error;
    }
    return error instanceof Error ? error.message : 'Ha ocurrido un error desconocido.';
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Mantenimiento de Batería</h1>
          <p className="text-slate-600 mt-2">
            Registra el mantenimiento realizado a la batería
          </p>
        </div>

        {recordMaintenanceMutation.isError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al registrar mantenimiento</CardTitle>
              <CardDescription className="text-red-700">
                {getErrorMessage(recordMaintenanceMutation.error)}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <MaintenanceForm
          batteryId={battery.id}
          batterySerialNumber={battery.serialNumber}
          onSubmit={handleSubmit}
          isSubmitting={recordMaintenanceMutation.isPending}
        />
      </div>
    </div>
  );
}
