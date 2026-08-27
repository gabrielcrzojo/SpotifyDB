import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

export const ExplicitComparison: React.FC = () => {
  const { data, loading, error, refetch } = useApi(api.getExplicitComparison);

  if (loading) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const chartData = [
    { name: 'Explicit', value: Number(data?.explicit.avgPopularity.toFixed(1)), fill: '#ef4444' },
    { name: 'Clean', value: Number(data?.nonExplicit.avgPopularity.toFixed(1)), fill: 'var(--color-primary)' }
  ];

  return (
    <div className="glass-card flex flex-col justify-between" style={{ padding: '1.5rem', height: '400px' }}>
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Explicit vs Non-Explicit Content</h3>
        <p style={{ fontSize: '0.875rem' }}>Average Popularity Comparison</p>
      </div>
      
      <div style={{ flex: 1, marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="var(--color-text-secondary)" />
            <YAxis dataKey="name" type="category" stroke="var(--color-text-secondary)" width={60} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
              contentStyle={{ background: '#18181b', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList dataKey="value" position="right" fill="var(--color-text-primary)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
