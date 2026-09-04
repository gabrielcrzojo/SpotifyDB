import React, { useState } from 'react';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { ScatterPlot } from './components/ScatterPlot';
import { ExplicitComparison } from './components/ExplicitComparison';
import { TopGenresChart } from './components/TopGenresChart';
import { GenreComparisonRadar } from './components/GenreComparisonRadar';
import { TopArtistsLeaderboard } from './components/TopArtistsLeaderboard';
import { TrackTable } from './components/TrackTable';
import { TrackModal } from './components/TrackModal';
import { PredictPopularity } from './components/PredictPopularity';
import { LayoutDashboard, Sliders, Award, Disc3, Sparkles } from 'lucide-react';

type TabType = 'overview' | 'genre-dna' | 'artists' | 'tracks' | 'predict';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview & Charts', icon: <LayoutDashboard size={18} /> },
    { id: 'genre-dna', label: 'Genre Audio DNA', icon: <Sliders size={18} /> },
    { id: 'artists', label: 'Top Artists', icon: <Award size={18} /> },
    { id: 'tracks', label: 'Track Explorer', icon: <Disc3 size={18} /> },
    { id: 'predict', label: 'Predict Popularity', icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="container">
      <Header />
      
      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'var(--transition-fast)',
              background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
              color: activeTab === tab.id ? '#0a0a0f' : 'var(--color-text-secondary)',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'predict' && <KPICards />}

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-6">
            <ScatterPlot onSelectTrack={(id) => setSelectedTrackId(id)} />
            <ExplicitComparison />
          </div>

          <TopGenresChart />

          <TrackTable onRowClick={(id) => setSelectedTrackId(id)} />
        </div>
      )}

      {/* Tab 2: Genre Audio DNA */}
      {activeTab === 'genre-dna' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <GenreComparisonRadar />
          <TopGenresChart />
        </div>
      )}

      {/* Tab 3: Top Artists */}
      {activeTab === 'artists' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <TopArtistsLeaderboard />
        </div>
      )}

      {/* Tab 4: Track Explorer */}
      {activeTab === 'tracks' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <TrackTable onRowClick={(id) => setSelectedTrackId(id)} />
        </div>
      )}

      {/* Tab 5: Predict popularity */}
      {activeTab === 'predict' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <PredictPopularity />
        </div>
      )}

      {/* Track Details Modal */}
      <TrackModal 
        trackId={selectedTrackId} 
        onClose={() => setSelectedTrackId(null)} 
      />
    </div>
  );
}

export default App;

