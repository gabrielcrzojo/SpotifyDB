import {
  ScatterPoint,
  ExplicitComparison,
  GenreData,
  GenreProfile,
  TopArtist,
  FeatureDistribution,
  GenreItem,
  Track,
  PaginatedResponse,
  SummaryStats
} from '../types';

const BASE_URL = 'http://localhost:3001/api';

async function fetchApi<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  let url = `${BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getSummaryStats: () =>
    fetchApi<SummaryStats>('/stats/summary'),

  getScatterPlotData: (params?: { xAxis?: string; yAxis?: string; genre?: string; explicit?: string; sampleSize?: number }) => 
    fetchApi<ScatterPoint[]>('/stats/scatter-plot', params),
    
  getExplicitComparison: () => 
    fetchApi<ExplicitComparison>('/stats/explicit-comparison'),
    
  getTopGenres: (limit = 10) => 
    fetchApi<GenreData[]>('/stats/top-genres', { limit }),

  getTopArtists: (params?: { limit?: number; sortBy?: 'popularity' | 'tracks'; minTracks?: number }) =>
    fetchApi<TopArtist[]>('/stats/top-artists', params),

  getGenreProfiles: (genres?: string[]) =>
    fetchApi<GenreProfile[]>('/stats/genre-profile', genres && genres.length > 0 ? { genres: genres.join(',') } : undefined),

  getFeatureDistribution: (params: { feature: string; bins?: number }) =>
    fetchApi<FeatureDistribution>('/stats/feature-distribution', params),

  getGenresList: () =>
    fetchApi<GenreItem[]>('/tracks/genres'),
    
  searchTracks: (params: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    explicit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minPop?: number;
    maxPop?: number;
  }) => 
    fetchApi<PaginatedResponse<Track>>('/tracks', params),
    
  getTrackById: (id: string) => 
    fetchApi<Track>(`/tracks/${id}`)
};

