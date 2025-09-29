import React from 'react';
import GenreCard from '@/components/Cards/GenreCard';

export default async function GenresPage() {
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
  if (!base) return <div className="p-6">TMDB API not configured.</div>;

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${base}/genre/movie/list?language=en-US`, { 
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }, 
      // cache: 'no-store' 
    }),
    fetch(`${base}/genre/tv/list?language=en-US`, { 
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }, 
      // cache: 'no-store' 
    }),
    // fetch(`${base}/genre/anime/list?language=en-Us`), {
    //   headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`},
    //   // cache: 'no-store'
    // }
  ]);

  if (!movieRes.ok && !tvRes.ok) return <div className="p-6">Failed to load genres.</div>;

  const movieJson = movieRes.ok ? await movieRes.json() : { genres: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { genres: [] };
  // const animeJson = animeRes.ok ? await animeRes.json() : { genres: [] } 

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
  // updateGenreCount(animeJson.genres || []);

  // Convert to array and sort by count (most common first) then by name
  const allGenres = Array.from(map.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-600">Movie & TV Genres</h1>
      </div>

      {/* Grid layout - 6 columns on xl screens, 5 on lg, 4 on md, 3 on sm, 2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {allGenres.map((genre) => (
          <GenreCard 
            key={genre.id} 
            id={genre.id} 
            name={genre.name} 
            className="w-full hover:scale-[1.01]"
          />
        ))}
      </div>
    </div>
  );
}
