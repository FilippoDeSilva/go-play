import React from 'react';
import MediaCard from '@/components/MediaCard';

type Props = { params: { id: string } };
type MediaResult = { id: number; title?: string; name?: string; poster_path?: string; media_type?: string };
type MappedMedia = { id: number; title: string; poster_url: string | null; media_type: string };

export default async function GenrePage({ params }: Props) {
  const id = params.id;
  const base = process.env.TMDB_API_URL;
  if (!base) return <div className="p-6">TMDB API not configured.</div>;

  // Fetch genre name
  const genreRes = await fetch(`${base}/genre/movie/list?language=en-US`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
    cache: 'no-store'
  });
  const genreData = await genreRes.json();
  const genreName = genreData.genres?.find((g: any) => g.id === Number(id))?.name || 'Genre';

  // Fetch movies and tv by genre id
  const [moviesRes, tvRes, animeRes] = await Promise.all([
    fetch(`${base}/discover/movie?with_genres=${id}&language=en-US&page=1&sort_by=popularity.desc`, { 
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, 
      cache: 'no-store' 
    }),
    fetch(`${base}/discover/tv?with_genres=${id}&language=en-US&page=1&sort_by=popularity.desc`, { 
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, 
      cache: 'no-store' 
    }),
    fetch(`${base}/search/multi?query=anime&with_genres=${id}&language=en-US&page=1`, { 
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, 
      cache: 'no-store' 
    }),
  ]);

  const moviesJson = moviesRes.ok ? await moviesRes.json() : { results: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { results: [] };
  const animeJson = animeRes.ok ? await animeRes.json() : { results: [] };

  const imageBase = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  const mapPoster = (item: MediaResult, type: 'movie' | 'tv' | 'anime' = 'movie') => ({
    id: item.id,
    title: (item.title || item.name || '').toString(),
    poster_url: item.poster_path ? `${imageBase}${item.poster_path}` : null,
    media_type: type,
  });

  const movies = (moviesJson.results || []) as MediaResult[];
  const tv = (tvJson.results || []) as MediaResult[];
  const animeRaw = (animeJson.results || []) as MediaResult[];

  const moviesMapped = movies.map(m => mapPoster(m, 'movie'));
  const tvMapped = tv.map(m => mapPoster({ ...m, media_type: 'tv' }, 'tv'));
  const animeMapped = animeRaw
    .filter((x) => x.media_type !== 'person')
    .map(m => mapPoster({ ...m, media_type: 'anime' }, 'anime'));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-600 mb-6">{genreName} Titles</h1>

      {moviesMapped.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Popular Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {moviesMapped.map((media) => (
              <MediaCard
                key={`movie-${media.id}`}
                id={media.id}
                title={media.title}
                posterUrl={media.poster_url}
                mediaType={media.media_type as 'movie' | 'tv' | 'anime'}
              />
            ))}
          </div>
        </section>
      )}

      {tvMapped.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">TV Shows</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tvMapped.map((media) => (
              <MediaCard
                key={`tv-${media.id}`}
                id={media.id}
                title={media.title}
                posterUrl={media.poster_url}
                mediaType="tv"
              />
            ))}
          </div>
        </section>
      )}

      {animeMapped.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Anime</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {animeMapped.map((media) => (
              <MediaCard
                key={`anime-${media.id}`}
                id={media.id}
                title={media.title}
                posterUrl={media.poster_url}
                mediaType="anime"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
