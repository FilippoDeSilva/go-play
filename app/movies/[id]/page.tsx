import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Video } from '@/types/TMDBMovie';
import { Star, Play } from 'lucide-react';

const PlayButton = dynamic(() => import('@/components/Player/PlayButton'));
type Params = { id: string }

async function getMovie(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/movie/${id}?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error('Failed to fetch movie')
  return res.json();
}

async function getVideos(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/movie/${id}/videos?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return { results: [] }
  return res.json();
}

async function getRecommendations(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/movie/${id}/recommendations?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return { results: [] }
  return res.json();
}

export default async function Page({ params }: { params: Params }) {
  const id = params.id;
  const movie = await getMovie(id);
  const videos = await getVideos(id);
  const recommendations = await getRecommendations(id);
  const trailer = (videos.results as Video[] || []).find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w780';
  type TMDBRec = {
    id: number;
    poster_path: string | null;
    title: string;
    vote_average?: number;
    release_date?: string;
  };

  return (
    <div className="max-w-6xl mx-auto pt-18">
      <div className="card-glass backdrop-blur-sm border border-gray-200/40 dark:border-gray-700/40 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
            <div className="w-full md:w-72 mx-auto">
            <div className="rounded-lg overflow-hidden shadow-md card-glass border border-gray-200/40 dark:border-gray-700/40">
              {movie.poster_path ? (
                <div className="relative h-0" style={{paddingBottom: '150%'}}>
                  <Image src={`${imageBase}${movie.poster_path}`} alt={movie.title} fill className="object-cover" />
                </div>
                ) : (
                <div className="w-full h-64 card-glass border border-gray-200/40 dark:border-gray-700/40" />
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-black dark:text-slate-300">{movie.title}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-900 dark:text-slate-300 mb-4">
              <div>{movie.release_date}</div>
              <div className="hidden sm:block">•</div>
              <div>{movie.runtime} min</div>
              <div className="hidden sm:block">•</div>
              <div className="flex flex-wrap gap-2">
                {(movie.genres || []).map((g:{name:string}) => (
                  <span key={g.name} className="text-xs px-2 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-900 dark:text-slate-200">{g.name}</span>
                ))}
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{movie.overview}</p>

            <div className="flex items-center gap-3">
              <PlayButton tmdbId={movie.id} media_type='movie' className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:brightness-110" />
              <a href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 border rounded-md text-slate-700 dark:text-slate-200 border-gray-200/60 dark:border-gray-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">View on TMDB</a>
            </div>
          </div>
        </div>

        {trailer ? (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Trailer</h3>
            <div className="aspect-video rounded-md overflow-hidden bg-slate-900/5 dark:bg-black border border-gray-200/30 dark:border-gray-700/30">
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
        ) : null}

        {recommendations?.results && recommendations.results.length > 0 ? (
          <div className="mt-10 sm:mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">You May Also Like</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {recommendations.results.slice(0, 6).map((m: TMDBRec) => (
                <a key={m.id} href={`/movies/${m.id}`} className="group block hover:opacity-90 transition-opacity">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-gray-200/50 dark:border-gray-700/50 group-hover:border-indigo-500/50 transition-colors">
                    {m.poster_path ? (
                      <Image
                        src={`${imageBase}${m.poster_path}`}
                        alt={m.title}
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
                        <span className="text-xs font-medium text-white">{(m.vote_average ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{m.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{m.release_date?.slice(0,4) || 'TBA'}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
