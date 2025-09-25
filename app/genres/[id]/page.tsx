import React from 'react';
import Image from 'next/image';

type Props = { params: { id: string } };
type MediaResult = { id: number; title?: string; name?: string; poster_path?: string; media_type?: string };
type MappedMedia = { id: number; title: string; poster_url: string | null; media_type: string };

export default async function GenrePage({ params }: Props) {
  const id = params.id;
  const base = process.env.TMDB_API_URL;
  if (!base) return <div className="p-6">TMDB API not configured.</div>;

  // Fetch movies and tv by genre id
  const [moviesRes, tvRes, animeRes] = await Promise.all([
    fetch(`${base}/discover/movie?with_genres=${id}&language=en-US&page=1`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, cache: 'no-store' }),
    fetch(`${base}/discover/tv?with_genres=${id}&language=en-US&page=1`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, cache: 'no-store' }),
    // approximate anime by searching keyword 'anime'
    fetch(`${base}/search/multi?query=anime&language=en-US&page=1`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, cache: 'no-store' }),
  ]);

  const moviesJson = moviesRes.ok ? await moviesRes.json() : { results: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { results: [] };
  const animeJson = animeRes.ok ? await animeRes.json() : { results: [] };

  const imageBase = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  const mapPoster = (item: MediaResult) => ({
    id: item.id,
    title: (item.title || item.name || '').toString(),
    poster_url: item.poster_path ? `${imageBase}${item.poster_path}` : null,
    media_type: item.media_type || 'movie',
  });

  const movies = (moviesJson.results || []) as MediaResult[];
  const tv = (tvJson.results || []) as MediaResult[];
  const animeRaw = (animeJson.results || []) as MediaResult[];

  const moviesMapped: MappedMedia[] = movies.map(mapPoster);
  const tvMapped: MappedMedia[] = tv.map(mapPoster);
  const animeMapped: MappedMedia[] = animeRaw.filter((x) => x.media_type !== 'person').map(mapPoster);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Genre {id}</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {moviesMapped.map(m => (
            <div key={m.id} className="rounded overflow-hidden bg-white dark:bg-slate-900 shadow">
              {m.poster_url ? <Image src={m.poster_url as string} alt={m.title} width={300} height={450} /> : <div className="h-40 bg-gray-200" />}
              <div className="p-2 text-sm">{m.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">TV Shows</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tvMapped.map(m => (
            <div key={m.id} className="rounded overflow-hidden bg-white dark:bg-slate-900 shadow">
              {m.poster_url ? <Image src={m.poster_url as string} alt={m.title} width={300} height={450} /> : <div className="h-40 bg-gray-200" />}
              <div className="p-2 text-sm">{m.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Anime-ish</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {animeMapped.map(m => (
            <div key={m.id} className="rounded overflow-hidden bg-white dark:bg-slate-900 shadow">
              {m.poster_url ? <Image src={m.poster_url as string} alt={m.title} width={300} height={450} /> : <div className="h-40 bg-gray-200" />}
              <div className="p-2 text-sm">{m.title}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
