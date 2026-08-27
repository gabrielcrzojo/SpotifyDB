export interface SummaryStats {
  totalTracks: number;
  totalGenres: number;
  totalArtists: number;
  explicitCount: number;
  cleanCount: number;
  explicitPercent: number;
  avgPopularity: number;
  avgDurationMs: number;
  avgDanceability: number;
  avgEnergy: number;
  avgValence: number;
  avgAcousticness: number;
}

export interface ScatterPoint {
  track_id: string;
  track_name: string;
  artists: string;
  track_genre?: string;
  danceability: number;
  popularity: number;
  energy?: number;
  valence?: number;
  acousticness?: number;
  speechiness?: number;
  instrumentalness?: number;
  liveness?: number;
  tempo?: number;
  loudness?: number;
  duration_ms?: number;
  explicit: boolean;
  x?: number;
  y?: number;
}

export interface ExplicitComparison {
  explicit: { avgPopularity: number; count: number };
  nonExplicit: { avgPopularity: number; count: number };
  percentageDifference: number;
}

export interface GenreData {
  genre: string;
  avgPopularity: number;
  trackCount: number;
  avgDanceability?: number;
  avgEnergy?: number;
  avgValence?: number;
}

export interface GenreProfile {
  genre: string;
  trackCount: number;
  avgPopularity: number;
  avgTempo: number;
  danceability: number;
  energy: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
}

export interface TopArtist {
  artist: string;
  avgPopularity: number;
  trackCount: number;
  avgDanceability: number;
  avgEnergy: number;
  genres: string[];
}

export interface FeatureDistribution {
  feature: string;
  min: number;
  max: number;
  bins: Array<{
    binLabel: string;
    rangeStart: number;
    rangeEnd: number;
    count: number;
  }>;
}

export interface GenreItem {
  genre: string;
  count: number;
}

export interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  album_name: string;
  popularity: number;
  duration_ms: number;
  explicit: boolean;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  time_signature: number;
  track_genre: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

