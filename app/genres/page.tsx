import React from 'react';
import Link from 'next/link';

export default async function GenresPage() {
  const base = process.env.TMDB_API_URL;
  if (!base) return <div className="p-6">TMDB API not configured.</div>;

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${base}/genre/movie/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, cache: 'no-store' }),
    fetch(`${base}/genre/tv/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, cache: 'no-store' }),
  ]);

  if (!movieRes.ok && !tvRes.ok) return <div className="p-6">Failed to load genres.</div>;

  const movieJson = movieRes.ok ? await movieRes.json() : { genres: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { genres: [] };

  const map = new Map<number, string>();
  type Genre = { id: number; name: string };
  (movieJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));
  (tvJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));

  const genres = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Genres</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {genres.map(g => (
          <Link key={g.id} href={`/genres/${g.id}`} className="block px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-center text-sm hover:underline">
            {g.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
