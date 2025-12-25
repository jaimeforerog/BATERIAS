import { useNavigate } from 'react-router-dom';
import { RegisterBatteryForm } from '../forms/RegisterBatteryForm';
import { useRegisterBattery } from '../hooks/useRegisterBattery';
import type { RegisterBatteryFormData } from '../schemas/registerBattery.schema';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterBatteryPage() {
  const navigate = useNavigate();
  const registerBatteryMutation = useRegisterBattery();

  const handleSubmit = async (data: RegisterBatteryFormData) => {
    try {
      const result = await registerBatteryMutation.mutateAsync(data);

      // Navigate to the batteries list on success
      navigate('/', {
        state: {
          message: `Batería ${data.serialNumber} registrada exitosamente. ID: ${result.batteryId}`
        }
      });
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Error registering battery:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Registrar Batería</h1>
          <p className="text-slate-600 mt-2">
            Registra una nueva batería en el inventario
          </p>
        </div>

        {registerBatteryMutation.isError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error al registrar la batería</CardTitle>
              <CardDescription className="text-red-700">
                {(registerBatteryMutation.error as any)?.response?.data?.error ||
                  registerBatteryMutation.error.message ||
                  'Ha ocurrido un error desconocido. Por favor, intenta nuevamente.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <RegisterBatteryForm
          onSubmit={handleSubmit}
          isSubmitting={registerBatteryMutation.isPending}
        />
      </div>
    </div>
  );
}
