import React, { useMemo, useState } from 'react';
import { Sparkles, Search, Music2 } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';
import { PopularityPredictResult, Track } from '../types';

const FEATURES: Array<{
  key: 'energy' | 'danceability' | 'liveness' | 'valence' | 'acousticness';
  label: string;
}> = [
  { key: 'energy', label: 'Energy' },
  { key: 'danceability', label: 'Danceability' },
  { key: 'liveness', label: 'Liveness' },
  { key: 'valence', label: 'Valence' },
  { key: 'acousticness', label: 'Acousticness' },
];

const DEFAULT_FORM = {
  energy: 0.65,
  danceability: 0.62,
  liveness: 0.15,
  valence: 0.48,
  acousticness: 0.12,
  duration_ms: 210000,
  track_genre: '',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--color-border)',
  color: 'white',
  padding: '0.5rem 0.8rem',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  fontSize: '0.9rem',
  width: '100%',
};

function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const PredictPopularity: React.FC = () => {
  const { data: meta, loading, error, refetch } = useApi(api.getPopularityMeta);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [search, setSearch] = useState('');
  const [hits, setHits] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [result, setResult] = useState<PopularityPredictResult | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const genreOptions = meta?.genres ?? [];
  const selectedGenre = form.track_genre || genreOptions[0] || '';

  const payload = useMemo(
    () => ({ ...form, track_genre: selectedGenre }),
    [form, selectedGenre]
  );

  const searchTracks = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const page = await api.searchTracks({ page: 1, limit: 6, search: search.trim() });
      setHits(page.data);
    } catch {
      setHits([]);
    } finally {
      setSearching(false);
    }
  };

  const fillFromTrack = (track: Track) => {
    setSelectedTrack(track);
    setForm({
      energy: Number(track.energy ?? 0),
      danceability: Number(track.danceability ?? 0),
      liveness: Number(track.liveness ?? 0),
      valence: Number(track.valence ?? 0),
      acousticness: Number(track.acousticness ?? 0),
      duration_ms: Number(track.duration_ms ?? 210000),
      track_genre: track.track_genre || selectedGenre,
    });
    setResult(null);
    setPredictError(null);
  };

  const runPredict = async () => {
    if (!payload.track_genre) return;
    setPredicting(true);
    setPredictError(null);
    try {
      const prediction = await api.predictPopularity(payload);
      setResult(prediction);
    } catch (err) {
      setResult(null);
      setPredictError(err instanceof Error ? err.message : 'Falha ao prever');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="chart" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const actualPop = selectedTrack?.popularity;
  const insideRange =
    result && actualPop !== undefined
      ? actualPop >= result.range_low && actualPop <= result.range_high
      : null;

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="glass-card flex flex-col gap-5" style={{ padding: '1.5rem' }}>
        <div>
          <h3>Predict popularity</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
            LightGBM sem peso. A faixa exibida é a previsão ± MAE do teste
            {meta ? ` (${meta.mae.toFixed(1)} pontos)` : ''}.
          </p>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Buscar faixa do dataset (opcional)
          </label>
          <div className="flex gap-2" style={{ marginTop: '0.45rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                }}
              />
              <input
                style={{ ...inputStyle, paddingLeft: '2.1rem' }}
                placeholder="Nome ou artista"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
              />
            </div>
            <button
              onClick={searchTracks}
              disabled={searching}
              style={{
                background: 'rgba(29,185,84,0.16)',
                border: '1px solid rgba(29,185,84,0.35)',
                color: 'var(--color-primary)',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {searching ? '...' : 'Buscar'}
            </button>
          </div>
          {hits.length > 0 && (
            <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {hits.map((track) => (
                <button
                  key={track.track_id}
                  onClick={() => fillFromTrack(track)}
                  style={{
                    textAlign: 'left',
                    background:
                      selectedTrack?.track_id === track.track_id
                        ? 'rgba(29,185,84,0.12)'
                        : 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--color-border)',
                    color: 'white',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{track.track_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {track.artists} · {track.track_genre} · pop {track.popularity}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          Gênero
          <select
            value={selectedGenre}
            onChange={(e) => setForm((prev) => ({ ...prev, track_genre: e.target.value }))}
            style={{ ...inputStyle, marginTop: '0.4rem' }}
          >
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        {FEATURES.map(({ key, label }) => (
          <label key={key} style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            <div className="flex justify-between">
              <span>{label}</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{form[key].toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={form[key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
              style={{ width: '100%', marginTop: '0.35rem' }}
            />
          </label>
        ))}

        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          <div className="flex justify-between">
            <span>Duration</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{formatDuration(form.duration_ms)}</span>
          </div>
          <input
            type="range"
            min={60000}
            max={480000}
            step={1000}
            value={form.duration_ms}
            onChange={(e) => setForm((prev) => ({ ...prev, duration_ms: Number(e.target.value) }))}
            style={{ width: '100%', marginTop: '0.35rem' }}
          />
        </label>

        <button
          onClick={runPredict}
          disabled={predicting || !selectedGenre}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'var(--color-primary)',
            color: '#0a0a0f',
            border: 'none',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            cursor: predicting ? 'wait' : 'pointer',
          }}
        >
          <Sparkles size={16} />
          {predicting ? 'Prevendo...' : 'Prever popularidade'}
        </button>
      </div>

      <div className="glass-card flex flex-col gap-4" style={{ padding: '1.5rem', minHeight: 360 }}>
        {!result && !predictError && (
          <div className="flex flex-col items-center justify-center" style={{ flex: 1, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            <Music2 size={42} color="var(--color-primary)" />
            <p style={{ marginTop: '1rem' }}>
              Ajuste as features ou carregue uma faixa e clique em prever.
              O resultado aparece como intervalo (previsão ± MAE).
            </p>
          </div>
        )}

        {predictError && (
          <p style={{ color: 'var(--color-error)' }}>{predictError}</p>
        )}

        {result && (
          <>
            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                Faixa prevista (± MAE)
              </p>
              <h2 style={{ fontSize: '3.2rem', lineHeight: 1.1, marginTop: '0.35rem' }}>
                {result.range_label}
              </h2>
              <p>
                Ponto estimado: <strong style={{ color: 'white' }}>{result.predicted.toFixed(1)}</strong>
                {' '}· MAE = {result.mae.toFixed(1)}
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                height: 14,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${result.range_low}%`,
                  width: `${Math.max(2, result.range_high - result.range_low)}%`,
                  top: 0,
                  bottom: 0,
                  background: 'rgba(29,185,84,0.55)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${result.predicted}%`,
                  top: -3,
                  width: 4,
                  height: 20,
                  borderRadius: 999,
                  background: '#fff',
                }}
              />
            </div>

            {selectedTrack && (
              <div style={{ fontSize: '0.9rem' }}>
                <p>
                  Faixa carregada: <strong style={{ color: 'white' }}>{selectedTrack.track_name}</strong>
                </p>
                <p>
                  Popularidade real: <strong style={{ color: 'white' }}>{selectedTrack.popularity}</strong>
                  {insideRange !== null && (
                    <span style={{ marginLeft: 8, color: insideRange ? 'var(--color-primary)' : '#fca5a5' }}>
                      {insideRange ? 'dentro da faixa' : 'fora da faixa'}
                    </span>
                  )}
                </p>
              </div>
            )}

            <p style={{ fontSize: '0.8rem' }}>
              {result.modelo}. Se o modelo prevê 50, a faixa vira {Math.max(0, Math.round(50 - result.mae))}–{Math.min(100, Math.round(50 + result.mae))} por causa do MAE.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
