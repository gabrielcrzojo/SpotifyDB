import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

export const TopGenresChart: React.FC = () => {
  const [limit, setLimit] = useState(10);
  const [metric, setMetric] = useState<'avgPopularity' | 'avgDanceability' | 'avgEnergy' | 'avgValence' | 'trackCount'>('avgPopularity');
  
  const { data, loading, error, refetch } = useApi(() => api.getTopGenres(50), []);

  if (loading && !data) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const metricLabels: Record<string, string> = {
    avgPopularity: 'Avg Popularity (0-100)',
    avgDanceability: 'Avg Danceability (0-1)',
    avgEnergy: 'Avg Energy (0-1)',
    avgValence: 'Avg Valence / Positivity (0-1)',
    trackCount: 'Total Tracks'
  };

  const isNormalized = ['avgDanceability', 'avgEnergy', 'avgValence'].includes(metric);

  const sortedData = [...(data || [])]
    .sort((a, b) => {
      const valA = a[metric] !== undefined ? a[metric]! : 0;
      const valB = b[metric] !== undefined ? b[metric]! : 0;
      return valB - valA;
    })
    .slice(0, limit);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="glass-card" style={{ padding: '0.875rem', background: '#18181b', border: '1px solid var(--color-border)' }}>
          <h4 style={{ textTransform: 'capitalize', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>{entry.genre}</h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            <div>Popularity: {entry.avgPopularity.toFixed(1)}/100</div>
            <div>Danceability: {(entry.avgDanceability || 0).toFixed(2)}</div>
            <div>Energy: {(entry.avgEnergy || 0).toFixed(2)}</div>
            <div>Valence: {(entry.avgValence || 0).toFixed(2)}</div>
            <div>Tracks: {entry.trackCount.toLocaleString()}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card flex flex-col justify-between" style={{ padding: '1.5rem', minHeight: '460px' }}>
      <div>
        <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3>Genre Leaderboard</h3>
            <p style={{ fontSize: '0.85rem' }}>Ranking 114+ genres by {metricLabels[metric]}</p>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <select 
              value={metric} 
              onChange={(e) => setMetric(e.target.value as any)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid var(--color-border)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: 'var(--radius-md)', 
                outline: 'none',
                fontSize: '0.85rem'
              }}
            >
              <option value="avgPopularity">Sort by Popularity</option>
              <option value="avgDanceability">Sort by Danceability</option>
              <option value="avgEnergy">Sort by Energy</option>
              <option value="avgValence">Sort by Valence (Happiness)</option>
              <option value="trackCount">Sort by Track Count</option>
            </select>

            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid var(--color-border)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: 'var(--radius-md)', 
                outline: 'none',
                fontSize: '0.85rem'
              }}
            >
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={25}>Top 25</option>
            </select>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, minHeight: `${Math.max(360, limit * 35)}px`, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <defs>
              <linearGradient id="genreBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis 
              type="number" 
              domain={isNormalized ? [0, 1] : metric === 'avgPopularity' ? [0, 100] : ['auto', 'auto']} 
              stroke="var(--color-text-secondary)" 
              tickFormatter={(v) => isNormalized ? v.toFixed(1) : v}
            />
            <YAxis 
              dataKey="genre" 
              type="category" 
              stroke="var(--color-text-primary)" 
              width={120} 
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
              tickFormatter={(value) => typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey={metric} radius={[0, 4, 4, 0]} barSize={18} fill="url(#genreBarGradient)">
              {sortedData.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
