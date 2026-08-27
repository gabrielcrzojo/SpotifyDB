import React, { useState } from 'react';
import { Award, Music, Flame, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

export const TopArtistsLeaderboard: React.FC = () => {
  const [sortBy, setSortBy] = useState<'popularity' | 'tracks'>('popularity');
  const [minTracks, setMinTracks] = useState(3);
  const [limit, setLimit] = useState(15);

  const { data, loading, error, refetch } = useApi(
    () => api.getTopArtists({ limit, sortBy, minTracks }),
    [limit, sortBy, minTracks]
  );

  return (
    <div className="glass-card flex flex-col gap-4" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award size={22} color="#f59e0b" />
            <h3>Artist Rankings & Hall of Fame</h3>
          </div>
          <p style={{ fontSize: '0.85rem' }}>Discover the most influential and prolific artists across the Spotify dataset</p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex bg-zinc-900 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setSortBy('popularity')}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: sortBy === 'popularity' ? 'var(--color-primary)' : 'transparent',
                color: sortBy === 'popularity' ? '#000' : 'var(--color-text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              Highest Popularity
            </button>
            <button
              onClick={() => setSortBy('tracks')}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: sortBy === 'tracks' ? 'var(--color-primary)' : 'transparent',
                color: sortBy === 'tracks' ? '#000' : 'var(--color-text-secondary)',
                transition: 'var(--transition-fast)'
              }}
            >
              Most Tracks
            </button>
          </div>

          <select
            value={minTracks}
            onChange={e => setMinTracks(Number(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid var(--color-border)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value={1}>Min 1 track</option>
            <option value={3}>Min 3 tracks</option>
            <option value={5}>Min 5 tracks</option>
            <option value={10}>Min 10 tracks</option>
          </select>

          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid var(--color-border)',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={25}>Top 25</option>
          </select>
        </div>
      </div>

      {loading && !data ? (
        <LoadingSkeleton variant="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
                <th style={{ padding: '0.75rem 1rem' }}>Artist</th>
                <th style={{ padding: '0.75rem 1rem' }}>Top Genres</th>
                <th style={{ padding: '0.75rem 1rem' }}>Tracks</th>
                <th style={{ padding: '0.75rem 1rem' }}>Avg Popularity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Danceability</th>
                <th style={{ padding: '0.75rem 1rem' }}>Energy</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((art, idx) => (
                <tr 
                  key={art.artist}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem', color: idx < 3 ? '#f59e0b' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{art.artist}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-1.5 flex-wrap">
                      {art.genres.map(g => (
                        <span key={g} className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-primary)' }}>
                    {art.trackCount}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${art.avgPopularity}%`, height: '100%', background: 'var(--color-primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{art.avgPopularity.toFixed(1)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {(art.avgDanceability * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {(art.avgEnergy * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
