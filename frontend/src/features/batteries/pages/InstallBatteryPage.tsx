import { useNavigate, useLocation } from 'react-router-dom';
import { InstallBatteryForm } from '../forms/InstallBatteryForm';
import { useInstallBattery } from '../hooks/useInstallBattery';
import type { InstallBatteryFormData } from '../schemas/installBattery.schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstallBatteryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const installBatteryMutation = useInstallBattery();

  // Get pre-filled data from navigation state (when coming from battery detail)
  const preFillData = location.state as { serialNumber?: string; model?: string } | null;

  const handleSubmit = async (data: InstallBatteryFormData) => {
    try {
      const result = await installBatteryMutation.mutateAsync(data);

      // Navigate immediately - WebSocket will handle cache updates automatically
      navigate('/', {
        state: {
          message: `Batería ${data.serialNumber} instalada exitosamente. ID: ${result.batteryId}`
        }
      });
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error installing battery:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Instalar Batería</h1>
          <p className="text-slate-600 mt-2">
            Registra la instalación de una nueva batería en un equipo
          </p>
        </div>

        {installBatteryMutation.isError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al instalar la batería</CardTitle>
              <CardDescription className="text-red-700">
                {installBatteryMutation.error instanceof Error
                  ? installBatteryMutation.error.message
                  : 'Ha ocurrido un error desconocido. Por favor, intenta nuevamente.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <InstallBatteryForm
          onSubmit={handleSubmit}
          isSubmitting={installBatteryMutation.isPending}
          initialSerialNumber={preFillData?.serialNumber}
          initialModel={preFillData?.model}
        />
      </div>
    </div>
  );
}
