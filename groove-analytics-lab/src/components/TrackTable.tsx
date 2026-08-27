import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Download, ExternalLink, X } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

export const TrackTable: React.FC<{ onRowClick: (id: string) => void }> = ({ onRowClick }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [explicit, setExplicit] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle genre list
  const { data: genreData } = useApi(api.getGenresList);

  const { data, loading, error, refetch } = useApi(
    () => api.searchTracks({ page, limit, search: debouncedSearch, genre, explicit, sortBy, sortOrder }),
    [page, limit, debouncedSearch, genre, explicit, sortBy, sortOrder]
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(['track_name', 'artists', 'album_name', 'track_genre'].includes(field) ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} color="var(--color-primary)" /> 
      : <ArrowDown size={14} color="var(--color-primary)" />;
  };

  const exportCSV = () => {
    if (!data?.data || data.data.length === 0) return;
    
    const headers = ['Track ID', 'Track Name', 'Artists', 'Album Name', 'Genre', 'Popularity', 'Duration (ms)', 'Explicit', 'Danceability', 'Energy'];
    const rows = data.data.map(t => [
      `"${t.track_id}"`,
      `"${(t.track_name || '').replace(/"/g, '""')}"`,
      `"${(t.artists || '').replace(/"/g, '""')}"`,
      `"${(t.album_name || '').replace(/"/g, '""')}"`,
      `"${t.track_genre || ''}"`,
      t.popularity,
      t.duration_ms,
      t.explicit ? 'Yes' : 'No',
      t.danceability,
      t.energy
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spotify_tracks_export_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card flex flex-col gap-4" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3>Track Explorer & Database</h3>
          <p style={{ fontSize: '0.85rem' }}>Browse, filter, sort, and inspect 89,000+ tracks</p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search tracks, artists, albums..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--color-border)', 
                color: 'white', 
                padding: '0.45rem 2rem 0.45rem 2.25rem', 
                borderRadius: 'var(--radius-md)', 
                outline: 'none',
                fontSize: '0.85rem',
                minWidth: '220px'
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select 
            value={genre} 
            onChange={e => { setGenre(e.target.value); setPage(1); }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="">All Genres</option>
            {genreData?.map(g => <option key={g.genre} value={g.genre}>{g.genre} ({g.count})</option>)}
          </select>

          <select 
            value={explicit} 
            onChange={e => { setExplicit(e.target.value); setPage(1); }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="">Any Explicit</option>
            <option value="true">Explicit Only</option>
            <option value="false">Clean Only</option>
          </select>

          <button
            onClick={exportCSV}
            title="Export current page to CSV"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--color-border)',
              color: 'white',
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {loading && !data ? <LoadingSkeleton variant="table" /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 1rem', width: '50px' }}>#</th>
                <th 
                  onClick={() => handleSort('track_name')} 
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1">Track {getSortIcon('track_name')}</div>
                </th>
                <th 
                  onClick={() => handleSort('artists')} 
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1">Artist {getSortIcon('artists')}</div>
                </th>
                <th 
                  onClick={() => handleSort('track_genre')} 
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1">Genre {getSortIcon('track_genre')}</div>
                </th>
                <th 
                  onClick={() => handleSort('popularity')} 
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1">Popularity {getSortIcon('popularity')}</div>
                </th>
                <th 
                  onClick={() => handleSort('danceability')} 
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1">Dance {getSortIcon('danceability')}</div>
                </th>
                <th 
                  onClick={() => handleSort('duration_ms')} 
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div className="flex items-center gap-1">Duration {getSortIcon('duration_ms')}</div>
                </th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Spotify</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((track, idx) => (
                <tr 
                  key={track.track_id} 
                  onClick={() => onRowClick(track.track_id)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    {((page - 1) * limit) + idx + 1}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{track.track_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{track.album_name}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    {track.artists}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize', fontSize: '0.85rem' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                      {track.track_genre}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '55px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${track.popularity}%`, height: '100%', background: 'var(--color-primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{track.popularity}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                    {(track.danceability * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {Math.floor(track.duration_ms / 60000)}:{Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {track.explicit ? <span className="badge badge-explicit">Explicit</span> : <span className="badge badge-clean">Clean</span>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <a 
                      href={`https://open.spotify.com/track/${track.track_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Open track in Spotify"
                      style={{ color: 'var(--color-text-secondary)', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center' }}
                      onMouseOver={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                      onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Showing {data?.data.length} of {data?.totalItems.toLocaleString()} tracks (Page {data?.currentPage} of {data?.totalPages.toLocaleString()})
              </span>
              <select
                value={limit}
                onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  padding: '0.45rem 0.75rem', 
                  background: 'rgba(255,255,255,0.08)', 
                  border: '1px solid var(--color-border)', 
                  color: 'white', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: page === 1 ? 'not-allowed' : 'pointer', 
                  opacity: page === 1 ? 0.5 : 1,
                  fontSize: '0.85rem'
                }}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span style={{ fontSize: '0.85rem', padding: '0 0.5rem' }}>
                {page} / {data?.totalPages || 1}
              </span>

              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page >= (data?.totalPages || 1)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  padding: '0.45rem 0.75rem', 
                  background: 'rgba(255,255,255,0.08)', 
                  border: '1px solid var(--color-border)', 
                  color: 'white', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: page >= (data?.totalPages || 1) ? 'not-allowed' : 'pointer', 
                  opacity: page >= (data?.totalPages || 1) ? 0.5 : 1,
                  fontSize: '0.85rem'
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

