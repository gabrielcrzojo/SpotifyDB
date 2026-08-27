import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';
import { Sliders, Sparkles, Layers } from 'lucide-react';

const COLORS = ['#1DB954', '#8b5cf6', '#38bdf8', '#f59e0b', '#ec4899'];

const DEFAULT_GENRES = ['acoustic', 'electronic', 'rock'];

export const GenreComparisonRadar: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(DEFAULT_GENRES);
  const [newGenreInput, setNewGenreInput] = useState('');

  const { data: allGenres } = useApi(api.getGenresList);

  const { data: profiles, loading, error, refetch } = useApi(
    () => api.getGenreProfiles(selectedGenres),
    [selectedGenres]
  );

  const addGenre = (genre: string) => {
    if (!genre || selectedGenres.includes(genre) || selectedGenres.length >= 5) return;
    setSelectedGenres([...selectedGenres, genre]);
  };

  const removeGenre = (genre: string) => {
    if (selectedGenres.length <= 1) return;
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  const radarAttributes = [
    { key: 'danceability', label: 'Danceability' },
    { key: 'energy', label: 'Energy' },
    { key: 'valence', label: 'Valence (Positivity)' },
    { key: 'acousticness', label: 'Acousticness' },
    { key: 'speechiness', label: 'Speechiness' },
    { key: 'instrumentalness', label: 'Instrumentalness' },
    { key: 'liveness', label: 'Liveness' }
  ];

  const chartData = radarAttributes.map(attr => {
    const row: any = { subject: attr.label };
    profiles?.forEach(p => {
      row[p.genre] = Number((p[attr.key as keyof typeof p] as number || 0).toFixed(3));
    });
    return row;
  });

  return (
    <div className="glass-card flex flex-col gap-6" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={20} color="var(--color-primary)" />
            <h3>Genre Audio DNA Profiler</h3>
          </div>
          <p style={{ fontSize: '0.85rem' }}>Compare the acoustic signatures and vibe characteristics of different musical genres</p>
        </div>

        {/* Genre Badges & Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap items-center">
            {selectedGenres.map((g, idx) => (
              <span 
                key={g} 
                className="badge" 
                style={{ 
                  background: `${COLORS[idx % COLORS.length]}22`, 
                  border: `1px solid ${COLORS[idx % COLORS.length]}88`,
                  color: COLORS[idx % COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              >
                {g}
                {selectedGenres.length > 1 && (
                  <button 
                    onClick={() => removeGenre(g)}
                    style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {selectedGenres.length < 5 && (
            <select
              value={newGenreInput}
              onChange={e => {
                if (e.target.value) {
                  addGenre(e.target.value);
                  setNewGenreInput('');
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                border: '1px solid var(--color-border)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="">+ Add Genre (Max 5)</option>
              {allGenres?.filter(g => !selectedGenres.includes(g.genre)).map(g => (
                <option key={g.genre} value={g.genre}>{g.genre}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading && !profiles ? (
        <LoadingSkeleton variant="chart" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-2 gap-6" style={{ alignItems: 'center' }}>
          {/* Radar Chart */}
          <div style={{ height: '380px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#18181b', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                  formatter={(val: number, name: string) => [val.toFixed(3), name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Legend 
                  formatter={(value) => <span style={{ color: 'var(--color-text-primary)', textTransform: 'capitalize', fontSize: '0.85rem' }}>{value}</span>}
                />
                {profiles?.map((p, idx) => (
                  <Radar 
                    key={p.genre} 
                    name={p.genre} 
                    dataKey={p.genre} 
                    stroke={COLORS[idx % COLORS.length]} 
                    fill={COLORS[idx % COLORS.length]} 
                    fillOpacity={0.25} 
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Genre Detail Cards */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              <Layers size={16} />
              <span>Comparative Genre Highlights</span>
            </div>

            {profiles?.map((p, idx) => (
              <div 
                key={p.genre} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`, 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem' 
                }}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ textTransform: 'capitalize', color: COLORS[idx % COLORS.length] }}>{p.genre}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {p.trackCount.toLocaleString()} tracks
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2" style={{ fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Popularity</span>
                    <strong>{p.avgPopularity.toFixed(1)}/100</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Tempo</span>
                    <strong>{Math.round(p.avgTempo)} BPM</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Energy</span>
                    <strong>{(p.energy * 100).toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>Valence</span>
                    <strong>{(p.valence * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
