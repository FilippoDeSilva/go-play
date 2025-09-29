import React from 'react';
import { SearchResult, Media } from '@/types/TMDBMovie';
import { headers } from 'next/headers';
import InfiniteGrid from '@/components/Search/InfiniteGrid';

type Props = { 
  searchParams: { q?: string } 
};

export default async function SearchPage({ searchParams }: Props) {
  // Get the search query from URL params
  const searchQuery = (searchParams).q;
  // const searchQuery = searchParams ? (await searchParams).q || '' : '';
  
  // If no search query, show popular genres
  if (!searchQuery) {
    return (
      <main className="container mx-auto p-6 bg-transparent pt-18">
        <div className="card-glass rounded-xl p-6 mb-8">
          <h4 className='flex justify-center items-center text-3xl text-slate-500 pb-8'>Search results for {searchQuery}</h4>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Browse Popular Genres</h1>
          <p className="text-gray-900 dark:text-gray-300 mb-6">
            Discover movies and TV shows by genre
          </p>
        </div>
      </main>
    );
  }

  // Fetch search results (host-aware)
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const protocol = process.env.VERCEL ? 'https' : 'http';
  const base = `${protocol}://${host}`;
  // Build URLs for both TV and Movies (page 1)
  const tvUrl = new URL(`/api/search?q=${encodeURIComponent(searchQuery)}&type=tv&page=1`, base).toString();
  const movieUrl = new URL(`/api/search?q=${encodeURIComponent(searchQuery)}&type=movie&page=1`, base).toString();
  const [tvRes, movieRes] = await Promise.all([
    fetch(tvUrl, { cache: 'no-store' }),
    fetch(movieUrl, { cache: 'no-store' })
  ]);
  if (!tvRes.ok && !movieRes.ok) return <div className="p-6">Failed to search</div>;
  const [tvJson, movieJson] = await Promise.all([
    tvRes.ok ? tvRes.json() : Promise.resolve({ results: [], page: 1, total_pages: 0 }),
    movieRes.ok ? movieRes.json() : Promise.resolve({ results: [], page: 1, total_pages: 0 })
  ]);

  // Transform and sort by newest year (TV uses first_air_date, Movies use release_date)
  const mapItem = (item: SearchResult): Media => ({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    poster_url: item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null),
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    media_type: item.media_type,
    overview: item.overview
  });

  const tvResults: Media[] = (tvJson.results || []).map(mapItem).sort((a: Media, b: Media) => {
    const ar = a.vote_average ?? 0;
    const br = b.vote_average ?? 0;
    if (br !== ar) return br - ar; // higher rating first
    const ay = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
    const by = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
    return by - ay; // newer first
  });
  const movieResults: Media[] = (movieJson.results || []).map(mapItem).sort((a: Media, b: Media) => {
    const ar = a.vote_average ?? 0;
    const br = b.vote_average ?? 0;
    if (br !== ar) return br - ar; // higher rating first
    const ay = a.release_date ? new Date(a.release_date).getTime() : 0;
    const by = b.release_date ? new Date(b.release_date).getTime() : 0;
    return by - ay; // newer first
  });
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between pt-18 px-2">
        <h1 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 mb-6 tracking-tight">
          Search results for &quot;{searchQuery}&quot;
        </h1>
      </div>

      {/* Movies first (to match your preference) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">Movies</h2>
        </div>
        {movieResults.length > 0 ? (
          <InfiniteGrid
            query={searchQuery}
            type="movie"
            initialItems={movieResults}
            initialPage={movieJson.page || 1}
            totalPages={movieJson.total_pages || 1}
          />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No movie results.</p>
        )}
      </section>

      {/* TV second */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">TV Shows</h2>
        </div>
        {tvResults.length > 0 ? (
          <InfiniteGrid
            query={searchQuery}
            type="tv"
            initialItems={tvResults}
            initialPage={tvJson.page || 1}
            totalPages={tvJson.total_pages || 1}
          />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No TV results.</p>
        )}
      </section>
    </div>
  );
}
