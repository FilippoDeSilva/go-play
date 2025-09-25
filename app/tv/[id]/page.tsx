import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star, Play } from 'lucide-react';
import dynamic from 'next/dynamic';
const PlayButton = dynamic(() => import('@/components/PlayButton'));

type Creator = {
  id: number;
  name: string;
};

type Network = {
  id: number;
  name: string;
  logo_path: string | null;
};

type Season = {
  id: number;
  name: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
};

type TVShowDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  created_by: Array<{ id: number; name: string }>;
  networks: Array<{ id: number; name: string; logo_path: string | null }>;
  seasons: Season[];
  recommendations?: {
    results: Array<{
      id: number;
      name: string;
      poster_path: string | null;
      vote_average: number;
      first_air_date: string;
    }>;
  };
};

// Helper function to build image URL
const buildImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

async function getTVShow(id: string) {
  const res = await fetch(`${process.env.TMDB_API_URL}/tv/${id}?append_to_response=credits,recommendations&language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch TV show');
  return res.json();
}

async function getVideos(id: string) {
  const res = await fetch(`${process.env.TMDB_API_URL}/tv/${id}/videos?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

export default async function TVShowPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  if (!process.env.TMDB_ACCESS_TOKEN) return <div className="p-6">TMDB API not configured.</div>;

  try {
    const [tvShow, videos] = await Promise.all([
      getTVShow(id),
      getVideos(id)
    ]);

    type Video = { site?: string; type?: string; key?: string; name?: string };
    const trailer = (videos.results as Video[] || []).find((v) => v.site === 'YouTube' && v.type === 'Trailer');

    const posterUrl = buildImageUrl(tvShow.poster_path);
    const backdropUrl = buildImageUrl(tvShow.backdrop_path, 'original');

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
            <div className="w-full md:w-72 mx-auto">
              <div className="rounded-lg overflow-hidden shadow-md bg-white/80 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50">
                {posterUrl ? (
                  <div className="relative h-0" style={{paddingBottom: '150%'}}>
                    <Image src={posterUrl} alt={tvShow.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-slate-500 dark:text-slate-300">No poster available</span>
            </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-black dark:text-slate-300">{tvShow.name}</h1>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-900 dark:text-slate-300 mb-4">
                <div>{new Date(tvShow.first_air_date).getFullYear()}</div>
                <div className="hidden sm:block">•</div>
                <div>{tvShow.number_of_seasons} season{tvShow.number_of_seasons !== 1 ? 's' : ''}</div>
                <div className="hidden sm:block">•</div>
                <div>{tvShow.number_of_episodes} episodes</div>
                {tvShow.episode_run_time?.[0] && (
                  <>
                    <div className="hidden sm:block">•</div>
                    <div>{tvShow.episode_run_time[0]}m</div>
                  </>
                )}
                <div className="hidden sm:block">•</div>
                <div className="flex flex-wrap gap-2">
                  {(tvShow.genres || []).map((g: {id: number, name: string}) => (
                    <span key={g.id} className="text-xs px-2 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-900 dark:text-slate-200">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  {tvShow.vote_average?.toFixed(1)}
                  <span className="text-slate-600 dark:text-slate-300 text-xs">({tvShow.vote_count})</span>
                </span>
              </div>

              <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-6">{tvShow.overview || 'No overview available.'}</p>

              <div className="flex items-center gap-3 mb-8">
                <PlayButton 
                  tmdbId={tvShow.id}
                  mediaType="tv"
                  seasonNumber={tvShow.number_of_seasons}
                  episodeNumber={1}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:brightness-110" 
                />
                <a 
                  href={`https://www.themoviedb.org/tv/${tvShow.id}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm px-3 py-2 border rounded-md text-slate-700 dark:text-slate-200 border-gray-200/60 dark:border-gray-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  View on TMDB
                </a>
              </div>
            </div>
          </div>

          {/* Seasons */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Seasons</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tvShow.seasons
                .filter((season: Season) => season.season_number > 0)
                .sort((a: Season, b: Season) => b.season_number - a.season_number)
                .map((season: Season) => {
                  const seasonImage = buildImageUrl(season.poster_path);
                  return (
                    <div 
                      key={season.id}
                      className="group bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm border border-gray-200/40 dark:border-gray-700/40 hover:border-indigo-500/50 transition-colors"
                    >
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
                          {season.episode_count} episodes • {season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {trailer && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-white">Trailer</h3>
              <div className="aspect-video rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 border border-gray-200/50 dark:border-gray-700/50">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Recommendations */}
          {tvShow.recommendations?.results?.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">You May Also Like</h3>
                <a 
                  href="/tv" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  View All
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tvShow.recommendations.results.slice(0, 6).map((show: { id: number; name: string; poster_path: string | null; vote_average: number; first_air_date: string }) => (
                  <a 
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
                            {show.vote_average?.toFixed(1)}
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
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error loading TV show details. Please try again later.</div>
      </div>
    );
  }
}
