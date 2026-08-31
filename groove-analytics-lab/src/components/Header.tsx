import React from 'react';
import { AudioLines } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header
      className="glass-card"
      style={{
        marginBottom: '2rem',
        padding: '1.75rem 2rem',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(110deg, rgba(29, 185, 84, 0.10) 0%, rgba(29, 185, 84, 0.035) 38%, rgba(10, 12, 13, 0.96) 78%)',
        border: '1px solid rgba(29, 185, 84, 0.18)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
      }}
    >
      {/* Glow decorativo */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '-80px',
          width: '360px',
          height: '360px',
          background:
            'radial-gradient(circle, rgba(29, 185, 84, 0.16) 0%, rgba(29, 185, 84, 0.05) 35%, transparent 72%)',
          filter: 'blur(25px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Linha de brilho discreta */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '2px',
          background:
            'linear-gradient(180deg, transparent 0%, var(--color-primary) 35%, var(--color-primary) 65%, transparent 100%)',
          opacity: 0.8,
          zIndex: 1,
        }}
      />

      <div
        className="flex items-center gap-4"
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Ícone */}
        <div
          style={{
            width: '48px',
            height: '48px',
            minWidth: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: 'rgba(29, 185, 84, 0.08)',
            border: '1px solid rgba(29, 185, 84, 0.16)',
            boxShadow: '0 0 22px rgba(29, 185, 84, 0.08)',
            transition: 'all 0.3s ease',
          }}
        >
          <AudioLines
            size={25}
            strokeWidth={1.8}
            color="var(--color-primary)"
            style={{
              filter: 'drop-shadow(0 0 7px rgba(29, 185, 84, 0.45))',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Conteúdo */}
        <div style={{ minWidth: 0 }}>
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '5px',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              opacity: 0.85,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                boxShadow: '0 0 8px rgba(29, 185, 84, 0.8)',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }}
            />

            Spotify Data Analytics
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: '#f2f5f3',
            }}
          >
            Groove{' '}
            <span
              style={{
                color: 'var(--color-primary)',
                textShadow: '0 0 22px rgba(29, 185, 84, 0.18)',
              }}
            >
              Analytics
            </span>{' '}
            Lab
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: 'rgba(220, 225, 222, 0.62)',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              letterSpacing: '0.01em',
            }}
          >
            Explore 89,000+ tracks with interactive data visualizations
          </p>
        </div>
      </div>
    </header>
  );
};
