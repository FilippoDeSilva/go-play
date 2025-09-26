import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Video } from '@/types/TMDBMovie';

const PlayButton = dynamic(() => import('@/components/PlayButton'));
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

export default async function Page({ params }: { params: Params }) {
  const id = params.id;
  const movie = await getMovie(id);
  const videos = await getVideos(id);
  const trailer = (videos.results as Video[] || []).find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w780';

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
      </div>
    </div>
  )
}
