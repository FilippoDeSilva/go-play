'use client';

import React from 'react';
import { Star, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { TVShowDetails } from '@/types/TMDBMovie';

// Dynamically import components with no SSR
const PlayButton = dynamic(() => import('@/components/Player/PlayButton'), { ssr: false });
const EpisodeSelector = dynamic(
  () => import('@/components/TV/EpisodeSelector').then((mod) => mod.EpisodeSelector),
  { ssr: false, loading: () => <div>Loading episode selector...</div> }
);

// Helper function to build image URL
const buildImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

async function getTVShow(id: string): Promise<TVShowDetails> {
  const apiUrl = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';
  const token = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || '';
  
  const res = await fetch(
    `${apiUrl}/tv/${id}?append_to_response=credits,recommendations&language=en-US`,
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 },
    }
  );
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('Failed to fetch TV show:', error);
    throw new Error(error.status_message || 'Failed to fetch TV show');
  }
  return res.json();
}

type TMDBVideo = { site: string; type: string; key: string; name?: string };

async function getVideos(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';
  const token = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || '';
  
  const res = await fetch(
    `${apiUrl}/tv/${id}/videos?language=en-US`, 
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 },
    }
  );
  
  if (!res.ok) {
    console.error('Failed to fetch videos');
    return { results: [] };
  }
  return res.json();
}

// Error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-6">
          <div className="text-red-500">
            Error loading TV show details: {this.state.error?.message || 'Unknown error'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function TVShowContent({ id }: { id: string }) {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [tvShow, setTvShow] = useState<TVShowDetails | null>(null);
  const [videos, setVideos] = useState<{ results: TMDBVideo[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const playRef = useRef<import('@/components/Player/PlayButton').PlayButtonHandle | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [showData, videoData] = await Promise.all([
          getTVShow(id),
          getVideos(id)
        ]);
        
        setTvShow(showData);
        setVideos(videoData);
        
        // Keep defaults to Season 1 / Episode 1 as requested
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load TV show'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle episode selection
  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(episodeNumber);
    // Auto-play when user selects an episode
    playRef.current?.open();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">
          Error loading TV show: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  // Find trailer
  const trailer = (videos?.results || []).find(
    (v: TMDBVideo) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  // Sort seasons by season number in descending order (newest first)
  const sortedSeasons = [...tvShow.seasons].sort((a, b) => b.season_number - a.season_number);
  
  const posterUrl = buildImageUrl(tvShow.poster_path);

  return (
    <div className="max-w-6xl mx-auto pt-18">
      <div className="card-glass backdrop-blur-sm border border-gray-200/40 dark:border-gray-700/40 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
          <div className="w-full md:w-72 mx-auto">
            <div className="rounded-lg overflow-hidden shadow-md card-glass border border-gray-200/40 dark:border-gray-700/40">
              {posterUrl ? (
                <div className="relative h-0" style={{paddingBottom: '150%'}}>
                  <Image src={posterUrl || ''} alt={tvShow.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-64 card-glass border border-gray-200/40 dark:border-gray-700/40" />
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-black dark:text-slate-300">{tvShow.name}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-900 dark:text-slate-300 mb-4">
              <div>{tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A'}</div>
              <div className="hidden sm:block">•</div>
              <div>{tvShow.number_of_seasons} season{tvShow.number_of_seasons !== 1 ? 's' : ''}</div>
              <div className="hidden sm:block">•</div>
              <div>{tvShow.number_of_episodes} episodes</div>
              {tvShow.episode_run_time?.[0] && (
                <>
                  <div className="hidden sm:block">•</div>
                  <div>{tvShow.episode_run_time[0]} min</div>
                </>
              )}
              <div className="hidden sm:block">•</div>
              <div className="flex flex-wrap gap-2">
                {tvShow.genres?.map((g) => (
                  <span key={g.id} className="text-xs px-2 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-900 dark:text-slate-200">{g.name}</span>
                ))}
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{tvShow.overview || 'No overview available.'}</p>

            <div className="flex items-center gap-3">
              <PlayButton ref={playRef} tmdbId={tvShow.id} media_type='tv' seasonNumber={selectedSeason} episodeNumber={selectedEpisode} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:brightness-110" />
              <a href={`https://www.themoviedb.org/tv/${tvShow.id}/season/${selectedSeason}/episode/${selectedEpisode}`} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-2 border rounded-md text-slate-700 dark:text-slate-200 border-gray-200/60 dark:border-gray-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Details</a>
              <a href={`https://www.themoviedb.org/tv/${tvShow.id}`} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-2 border rounded-md text-slate-700 dark:text-slate-200 border-gray-200/60 dark:border-gray-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">View on TMDB</a>
            </div>

            {/* Season & Episode Selectors (always visible; column on small, row on larger screens) */}
            <div className="mt-4">
              <EpisodeSelector
                seasons={sortedSeasons}
                tvId={tvShow.id}
                onSelect={handleEpisodeSelect}
                defaultSeason={selectedSeason}
                defaultEpisode={selectedEpisode}
              />
            </div>
          </div>
        </div>

        {/* Seasons */}
        {tvShow.seasons?.length > 0 && (
          <div className="mt-10 sm:mt-12">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Seasons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {sortedSeasons
                .filter((season) => season.season_number > 0)
                .map((season) => {
                  const seasonImage = buildImageUrl(season.poster_path);
                  return (
                    <Link 
                      key={season.id}
                      href={`/tv/${tvShow.id}/season/${season.season_number}`}
                      className="group block"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm border border-gray-200/40 dark:border-gray-700/40 hover:border-indigo-500/50 transition-colors">
                        <div className="relative aspect-[2/3]">
                          {seasonImage ? (
                            <Image
                              src={seasonImage}
                              alt={season.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <span className="text-slate-400 text-sm">No image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-black/80 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                              <Play className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                            {season.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {season.episode_count} episodes •{' '}
                            {season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}

        {/* Trailer */}
        {trailer?.key && (
          <div className="mt-10 sm:mt-12">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Trailer</h2>
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-gray-200/50 dark:border-gray-700/50">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name || 'Trailer'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Recommendations */}
        {tvShow.recommendations?.results && tvShow.recommendations.results.length > 0 && (
          <div className="mt-10 sm:mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">You May Also Like</h2>
              <Link 
                href="/tv"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {tvShow.recommendations.results.slice(0, 6).map((show) => (
                <Link 
                  key={show.id}
                  href={`/tv/${show.id}`}
                  className="group block hover:opacity-90 transition-opacity"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-gray-200/50 dark:border-gray-700/50 group-hover:border-indigo-500/50 transition-colors">
                    {show.poster_path ? (
                      <Image
                        src={buildImageUrl(show.poster_path) || ''}
                        alt={show.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 text-sm">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-black/80 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                        <Play className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-white">
                          {show.vote_average?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                      {show.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
  );
}

// This is a Server Component that wraps the client component
export default function TVShowPage({ params }: { params: { id: string } }) {
  // Server-side environment variable check
  if (!process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_TMDB_API_URL) {
    console.log('TMDB_ACCESS_TOKEN:', process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN ? 'Exists' : 'Missing');
    console.log('TMDB_API_URL:', process.env.NEXT_PUBLIC_TMDB_API_URL || 'Not set');
    return (
      <div className="p-6 text-red-500">
        <p>TMDB API not configured. Please check your environment variables.</p>
        <p className="mt-2 text-sm">Make sure your .env.local file is in the root of your project and contains the required variables.</p>
      </div>
    );
  }

  // Extract the id from params
  const { id } = params;

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <TVShowContent id={id} />
    </Suspense>
  );
}

// Assign the error boundary to the component
TVShowPage.ErrorBoundary = ErrorBoundary;
