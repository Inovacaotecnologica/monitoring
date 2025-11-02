import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartRealtimeProps {
  data: { ts: number; value: number }[];
  color?: string;
}

// Componente de gráfico simples para exibir uma série temporal em tempo real.
const ChartRealtime: React.FC<ChartRealtimeProps> = ({ data, color = '#3b82f6' }) => {
  return (
    <div className="card" style={{ width: '100%', height: '240px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis
            dataKey="ts"
            tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip
            formatter={(value: any) => `${value}%`}
            labelFormatter={(ts: any) => new Date(ts).toLocaleTimeString()}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRealtime;