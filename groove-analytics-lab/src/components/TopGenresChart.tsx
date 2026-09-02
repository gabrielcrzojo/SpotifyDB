import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

type MetricKey = 'avgPopularity' | 'avgDanceability' | 'avgEnergy' | 'avgValence' | 'trackCount';

const METRIC_OPTIONS: Array<{ value: MetricKey; label: string }> = [
  { value: 'avgPopularity', label: 'Popularity' },
  { value: 'avgDanceability', label: 'Danceability' },
  { value: 'avgEnergy', label: 'Energy' },
  { value: 'avgValence', label: 'Valence (Happiness)' },
  { value: 'trackCount', label: 'Track Count' },
];

const METRIC_LABELS: Record<MetricKey, string> = {
  avgPopularity: 'Avg Popularity (0-100)',
  avgDanceability: 'Avg Danceability (0-1)',
  avgEnergy: 'Avg Energy (0-1)',
  avgValence: 'Avg Valence / Positivity (0-1)',
  trackCount: 'Total Tracks',
};

const LIMIT_OPTIONS = [10, 15, 25];

const BAR_HEIGHT = 32;
const CHART_PADDING = 40;

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  border: '1px solid var(--color-border)',
  padding: '0.4rem 0.8rem',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  fontSize: '0.85rem',
};

export const TopGenresChart: React.FC = () => {
  const [limit, setLimit] = useState(10);
  const [metric, setMetric] = useState<MetricKey>('avgPopularity');

  const { data, loading, error, refetch } = useApi(() => api.getTopGenres(50), []);

  const isNormalized = ['avgDanceability', 'avgEnergy', 'avgValence'].includes(metric);

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => {
        const valA = (a as any)[metric] ?? 0;
        const valB = (b as any)[metric] ?? 0;
        return valB - valA;
      })
      .slice(0, limit);
  }, [data, metric, limit]);

  const chartHeight = sortedData.length * BAR_HEIGHT + CHART_PADDING;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="glass-card" style={{ padding: '0.875rem', background: '#18181b', border: '1px solid var(--color-border)' }}>
          <h4 style={{ textTransform: 'capitalize', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>{entry.genre}</h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            <div>Popularity: {entry.avgPopularity?.toFixed(1) ?? '—'}/100</div>
            <div>Danceability: {(entry.avgDanceability ?? 0).toFixed(2)}</div>
            <div>Energy: {(entry.avgEnergy ?? 0).toFixed(2)}</div>
            <div>Valence: {(entry.avgValence ?? 0).toFixed(2)}</div>
            <div>Tracks: {entry.trackCount?.toLocaleString() ?? '—'}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !data) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!sortedData.length) return null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h3>Genre Leaderboard</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Ranking 114+ genres by {METRIC_LABELS[metric]}
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricKey)}
            style={selectStyle}
          >
            {METRIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>Sort by {opt.label}</option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={selectStyle}
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>Top {n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart — fixed pixel height so ResponsiveContainer never collapses */}
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
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
              tickFormatter={(v) => (isNormalized ? v.toFixed(1) : String(v))}
            />
            <YAxis
              dataKey="genre"
              type="category"
              stroke="var(--color-text-primary)"
              width={120}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickFormatter={(value) =>
                typeof value === 'string'
                  ? value.charAt(0).toUpperCase() + value.slice(1)
                  : value
              }
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
