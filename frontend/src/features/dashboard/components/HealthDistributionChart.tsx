import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { HealthDistribution } from '../utils/aggregators';
import { HealthStatus } from '@/api/types/enums';

interface HealthDistributionChartProps {
  data: HealthDistribution[];
}

const HEALTH_COLORS: Record<HealthStatus, string> = {
  [HealthStatus.Excellent]: '#22c55e', // green-500
  [HealthStatus.Good]: '#84cc16', // lime-500
  [HealthStatus.Fair]: '#eab308', // yellow-500
  [HealthStatus.Poor]: '#f97316', // orange-500
  [HealthStatus.Critical]: '#ef4444', // red-500
};

export function HealthDistributionChart({ data }: HealthDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Salud</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Salud</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`
              }
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={HEALTH_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
