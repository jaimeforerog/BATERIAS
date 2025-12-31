import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { StatusDistribution } from '../utils/aggregators';
import { BatteryStatus } from '@/api/types/enums';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
}

const STATUS_COLORS: Record<BatteryStatus, string> = {
  [BatteryStatus.New]: '#0ea5e9', // sky-500
  [BatteryStatus.Installed]: '#22c55e', // green-500
  [BatteryStatus.Removed]: '#f97316', // orange-500
  [BatteryStatus.Disposed]: '#64748b', // slate-500
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
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
        <CardTitle>Distribución por Estado</CardTitle>
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
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
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
