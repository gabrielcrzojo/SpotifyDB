import React, { useEffect, useState } from 'react';
import { Database, LayoutGrid, Users, AlertTriangle, Activity, Zap } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { LoadingSkeleton, ErrorState } from './Shared';

const AnimatedNumber: React.FC<{ value: number; suffix?: string; isPercent?: boolean; decimals?: number }> = ({ 
  value, 
  suffix = '', 
  isPercent = false,
  decimals = 1 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 800;
    const steps = 30;
    const increment = end / steps;
    let stepCount = 0;
    
    const timer = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps || start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);

  const formatted = isPercent || decimals === 1
    ? displayValue.toFixed(decimals) 
    : Math.floor(displayValue).toLocaleString();

  return <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatted}{suffix}</h2>;
};

export const KPICards: React.FC = () => {
  const { data, loading, error, refetch } = useApi(api.getSummaryStats);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }
  
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const cards = [
    { 
      title: 'Total Tracks', 
      value: data?.totalTracks || 0, 
      icon: <Database size={20} color="#3b82f6" />, 
      suffix: '',
      decimals: 0
    },
    { 
      title: 'Total Genres', 
      value: data?.totalGenres || 0, 
      icon: <LayoutGrid size={20} color="#8b5cf6" />,
      decimals: 0
    },
    { 
      title: 'Unique Artists', 
      value: data?.totalArtists || 0, 
      icon: <Users size={20} color="#06b6d4" />,
      decimals: 0
    },
    { 
      title: 'Explicit Content', 
      value: data?.explicitPercent || 0, 
      icon: <AlertTriangle size={20} color="#ef4444" />, 
      suffix: '%', 
      isPercent: true 
    },
    { 
      title: 'Avg Popularity', 
      value: data?.avgPopularity || 0, 
      icon: <Activity size={20} color="#10b981" />, 
      suffix: '/100',
      decimals: 1
    },
    { 
      title: 'Avg Energy', 
      value: (data?.avgEnergy || 0) * 100, 
      icon: <Zap size={20} color="#f59e0b" />, 
      suffix: '%',
      isPercent: true
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
      {cards.map((card, i) => (
        <div key={i} className="glass-card flex flex-col justify-between gap-3" style={{ padding: '1.25rem' }}>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</span>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              {card.icon}
            </div>
          </div>
          <AnimatedNumber 
            value={card.value} 
            suffix={card.suffix} 
            isPercent={card.isPercent} 
            decimals={card.decimals}
          />
        </div>
      ))}
    </div>
  );
};

