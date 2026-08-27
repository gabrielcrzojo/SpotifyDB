import React from 'react';
import { Music2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="glass-card" style={{ marginBottom: '2rem', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(29, 185, 84, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
      <div className="flex items-center gap-4" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(29, 185, 84, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
          <Music2 size={32} color="var(--color-primary)" style={{ animation: 'pulseGlow 2s infinite' }} />
        </div>
        <div>
          <h1 className="header-gradient">Groove Analytics Lab</h1>
          <p>Explore 89,000+ tracks with interactive data visualizations</p>
        </div>
      </div>
    </header>
  );
};
