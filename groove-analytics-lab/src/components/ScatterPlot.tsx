import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

interface ScatterPlotProps {
  onSelectTrack?: (id: string) => void;
}

const FEATURE_OPTIONS = [
  { value: 'danceability', label: 'Danceability (0-1)' },
  { value: 'energy', label: 'Energy (0-1)' },
  { value: 'valence', label: 'Valence / Happiness (0-1)' },
  { value: 'acousticness', label: 'Acousticness (0-1)' },
  { value: 'speechiness', label: 'Speechiness (0-1)' },
  { value: 'liveness', label: 'Liveness (0-1)' },
  { value: 'instrumentalness', label: 'Instrumentalness (0-1)' },
  { value: 'popularity', label: 'Popularity (0-100)' },
  { value: 'tempo', label: 'Tempo (BPM)' },
  { value: 'loudness', label: 'Loudness (dB)' }
];

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ onSelectTrack }) => {
  const [xAxis, setXAxis] = useState('danceability');
  const [yAxis, setYAxis] = useState('popularity');
  const [selectedGenre, setSelectedGenre] = useState('');

  const { data: genresData } = useApi(api.getGenresList);
  
  const { data, loading, error, refetch } = useApi(
    () => api.getScatterPlotData({ xAxis, yAxis, genre: selectedGenre, sampleSize: 1200 }),
    [xAxis, yAxis, selectedGenre]
  );

  const xOption = FEATURE_OPTIONS.find(o => o.value === xAxis) || FEATURE_OPTIONS[0];
  const yOption = FEATURE_OPTIONS.find(o => o.value === yAxis) || FEATURE_OPTIONS[7];

  const getDomain = (feature: string): [number | string, number | string] => {
    if (['danceability', 'energy', 'valence', 'acousticness', 'speechiness', 'instrumentalness', 'liveness'].includes(feature)) {
      return [0, 1];
    }
    if (feature === 'popularity') return [0, 100];
    if (feature === 'tempo') return ['auto', 'auto'];
    if (feature === 'loudness') return ['auto', 'auto'];
    return ['auto', 'auto'];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="glass-card" style={{ padding: '0.875rem', background: '#18181b', minWidth: '180px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{point.track_name}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{point.artists}</p>
          {point.track_genre && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
              Genre: {point.track_genre}
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
            <div>{xOption.label.split(' ')[0]}: {typeof point.x === 'number' ? point.x.toFixed(2) : point.x}</div>
            <div>{yOption.label.split(' ')[0]}: {typeof point.y === 'number' ? (yAxis === 'popularity' ? point.y : point.y.toFixed(2)) : point.y}</div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            Click to inspect track
          </div>
        </div>
      );
    }
    return null;
  };

  const explicitData = data?.filter(d => d.explicit) || [];
  const cleanData = data?.filter(d => !d.explicit) || [];

  return (
    <div className="glass-card flex flex-col justify-between" style={{ padding: '1.5rem', minHeight: '440px' }}>
      <div>
        <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
          <div>
            <h3>Multidimensional Audio Correlation</h3>
            <p style={{ fontSize: '0.85rem' }}>Cross-analyze audio attributes across {data?.length || 0} sampled tracks</p>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid var(--color-border)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="">All Genres</option>
              {genresData?.map(g => (
                <option key={g.genre} value={g.genre}>{g.genre}</option>
              ))}
            </select>

            <select 
              value={xAxis} 
              onChange={e => setXAxis(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid var(--color-border)', 
                padding: '0.35rem 0.75rem', 
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none' 
              }}
            >
              {FEATURE_OPTIONS.map(opt => (
                <option key={`x-${opt.value}`} value={opt.value}>X: {opt.label}</option>
              ))}
            </select>

            <select 
              value={yAxis} 
              onChange={e => setYAxis(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid var(--color-border)', 
                padding: '0.35rem 0.75rem', 
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none' 
              }}
            >
              {FEATURE_OPTIONS.map(opt => (
                <option key={`y-${opt.value}`} value={opt.value}>Y: {opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, height: '320px', minHeight: '300px', width: '100%' }}>
        {loading && !data ? (
          <LoadingSkeleton variant="chart" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={xOption.label} 
                domain={getDomain(xAxis)} 
                stroke="var(--color-text-secondary)" 
                tickFormatter={(v) => typeof v === 'number' ? (xAxis === 'tempo' || xAxis === 'loudness' || xAxis === 'popularity' ? v.toFixed(0) : v.toFixed(1)) : v} 
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={yOption.label} 
                domain={getDomain(yAxis)} 
                stroke="var(--color-text-secondary)" 
                tickFormatter={(v) => typeof v === 'number' ? (yAxis === 'tempo' || yAxis === 'loudness' || yAxis === 'popularity' ? v.toFixed(0) : v.toFixed(1)) : v} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Clean Tracks" 
                data={cleanData} 
                fill="var(--color-primary)" 
                opacity={0.65} 
                onClick={(entry: any) => onSelectTrack && onSelectTrack(entry.track_id)}
                style={{ cursor: 'pointer' }}
              />
              <Scatter 
                name="Explicit Tracks" 
                data={explicitData} 
                fill="#ef4444" 
                opacity={0.65} 
                onClick={(entry: any) => onSelectTrack && onSelectTrack(entry.track_id)}
                style={{ cursor: 'pointer' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-between items-center" style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }}></span>
            <span>Clean Tracks ({cleanData.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span>Explicit Tracks ({explicitData.length})</span>
          </div>
        </div>
        <span>Click any dot to inspect track details</span>
      </div>
    </div>
  );
};

