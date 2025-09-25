import React from 'react';
import GenreCard from '@/components/GenreCard';

export default async function GenresPage() {
  const base = process.env.TMDB_API_URL;
  if (!base) return <div className="p-6">TMDB API not configured.</div>;

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${base}/genre/movie/list?language=en-US`, { 
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, 
      cache: 'no-store' 
    }),
    fetch(`${base}/genre/tv/list?language=en-US`, { 
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, 
      cache: 'no-store' 
    }),
  ]);

  if (!movieRes.ok && !tvRes.ok) return <div className="p-6">Failed to load genres.</div>;

  const movieJson = movieRes.ok ? await movieRes.json() : { genres: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { genres: [] };

  const map = new Map<number, { id: number; name: string; count: number }>();
  
  // Helper function to count genre occurrences
  const updateGenreCount = (genres: Array<{ id: number; name: string }>) => {
    genres.forEach((g) => {
      const existing = map.get(g.id) || { ...g, count: 0 };
      map.set(g.id, {
        ...existing,
        count: existing.count + 1
      });
    });
  };

  updateGenreCount(movieJson.genres || []);
  updateGenreCount(tvJson.genres || []);

  // Convert to array and sort by count (most common first) then by name
  const genres = Array.from(map.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

  // Popular genres to show at the top
  const popularGenres = genres.filter(g => g.count > 1);
  const otherGenres = genres.filter(g => g.count === 1);

  return (
    <main className="container mx-auto p-6">
      <div className="card-glass rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Browse All Genres</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Explore movies and TV shows by genre
        </p>
        
        {popularGenres.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-gray-200">Popular Genres</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {popularGenres.map((genre) => (
                <GenreCard key={genre.id} id={genre.id} name={genre.name} />
              ))}
            </div>
          </>
        )}

        {otherGenres.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-gray-200">All Genres</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {otherGenres.map((genre) => (
                <GenreCard key={genre.id} id={genre.id} name={genre.name} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
