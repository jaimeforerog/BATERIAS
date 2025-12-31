import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { BrandDistribution } from '../utils/aggregators';

interface BrandDistributionChartProps {
  data: BrandDistribution[];
}

export function BrandDistributionChart({ data }: BrandDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Marcas</CardTitle>
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
        <CardTitle>Top 10 Marcas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0ea5e9" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
