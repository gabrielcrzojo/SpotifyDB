import React, { useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { X, ExternalLink, Music, Disc } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

interface TrackModalProps {
  trackId: string | null;
  onClose: () => void;
}

export const TrackModal: React.FC<TrackModalProps> = ({ trackId, onClose }) => {
  const { data: track, loading, error, refetch } = useApi(
    () => trackId ? api.getTrackById(trackId) : Promise.reject('No ID'), 
    [trackId]
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!trackId) return null;

  return (
    <div 
      className="flex items-center justify-center animate-fade-in" 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 999, padding: '1.5rem' }}
      onClick={onClose}
    >
      <div 
        className="glass-card flex flex-col" 
        style={{ 
          width: '100%', 
          maxWidth: '960px', 
          maxHeight: '92vh', 
          overflow: 'auto', 
          background: '#0d0d14', 
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '2rem', 
          position: 'relative',
          borderRadius: 'var(--radius-lg)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          aria-label="Close modal"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseOver={e => (e.currentTarget.style.color = '#fff')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <X size={20} />
        </button>

        {loading ? <LoadingSkeleton variant="table" /> : error ? <ErrorState message={error} onRetry={refetch} /> : track && (
          <div className="grid grid-cols-2 gap-8" style={{ alignItems: 'start' }}>
            {/* Left Column: Track Info & Metadata */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                  {track.explicit ? (
                    <span className="badge badge-explicit">EXPLICIT</span>
                  ) : (
                    <span className="badge badge-clean">CLEAN</span>
                  )}
                  <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', textTransform: 'capitalize' }}>
                    {track.track_genre}
                  </span>
                </div>

                <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.35rem' }}>
                  {track.track_name}
                </h2>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>
                  {track.artists}
                </h3>

                <div className="flex items-center gap-2" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                  <Disc size={16} />
                  <span>Album: <strong style={{ color: 'var(--color-text-primary)' }}>{track.album_name}</strong></span>
                </div>

                {/* Popularity bar */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Popularity Score</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{track.popularity} / 100</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${track.popularity}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }} />
                  </div>
                </div>

                {/* Spotify Link Action */}
                <a 
                  href={`https://open.spotify.com/track/${track.track_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--color-primary)',
                    color: '#000',
                    fontWeight: 600,
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#1ed760')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--color-primary)')}
                >
                  <ExternalLink size={16} /> Open in Spotify
                </a>
              </div>

              {/* Technical / Audio specs grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tempo', value: `${Math.round(track.tempo)} BPM` },
                  { label: 'Duration', value: `${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}` },
                  { label: 'Key', value: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][track.key] || 'Unknown' },
                  { label: 'Mode', value: track.mode === 1 ? 'Major' : 'Minor' },
                  { label: 'Time Sig', value: `${track.time_signature}/4` },
                  { label: 'Loudness', value: `${track.loudness.toFixed(1)} dB` }
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Audio DNA Radar */}
            <div className="flex flex-col justify-between" style={{ height: '100%', minHeight: '400px' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>Acoustic Fingerprint</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Normalized audio features (scale 0.0 - 1.0)</p>
              </div>

              <div style={{ height: '320px', width: '100%', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={[
                    { subject: 'Danceability', value: track.danceability },
                    { subject: 'Energy', value: track.energy },
                    { subject: 'Speechiness', value: track.speechiness },
                    { subject: 'Acousticness', value: track.acousticness },
                    { subject: 'Instrumental', value: track.instrumentalness },
                    { subject: 'Liveness', value: track.liveness },
                    { subject: 'Valence', value: track.valence }
                  ]}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#18181b', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                      itemStyle={{ color: 'var(--color-primary)' }}
                      formatter={(val: number) => val.toFixed(3)}
                    />
                    <Radar name={track.track_name} dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.45} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Feature summary row */}
              <div className="grid grid-cols-3 gap-2" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                  Dance: <strong style={{ color: '#fff' }}>{(track.danceability * 100).toFixed(0)}%</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                  Energy: <strong style={{ color: '#fff' }}>{(track.energy * 100).toFixed(0)}%</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                  Valence: <strong style={{ color: '#fff' }}>{(track.valence * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

