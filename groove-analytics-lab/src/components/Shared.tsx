import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const LoadingSkeleton: React.FC<{ variant?: 'card' | 'chart' | 'table' | 'text' }> = ({ variant = 'card' }) => {
  const baseStyle = { width: '100%' };
  if (variant === 'card') return <div className="skeleton" style={{ ...baseStyle, height: '120px' }}></div>;
  if (variant === 'chart') return <div className="skeleton" style={{ ...baseStyle, height: '350px' }}></div>;
  if (variant === 'table') return <div className="skeleton" style={{ ...baseStyle, height: '400px' }}></div>;
  return <div className="skeleton" style={{ ...baseStyle, height: '24px' }}></div>;
};

export const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center gap-4" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
      <AlertCircle size={48} color="var(--color-error)" />
      <div>
        <h3>Something went wrong</h3>
        <p style={{ color: 'var(--color-error)', marginTop: '0.5rem' }}>{message}</p>
      </div>
      <button 
        onClick={onRetry}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'white',
          padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)',
          cursor: 'pointer', fontWeight: 600, transition: 'var(--transition-fast)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  );
};
