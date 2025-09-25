import React from 'react';
import GenreCard from '@/components/GenreCard';
import MovieCardGrid from '@/components/MovieCardGrid';

type Props = { searchParams: { q?: string } };

const popularGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
  { id: 878, name: 'Science Fiction' },
];

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q || '';
  
  // If no search query, show popular genres
  if (!q) {
    return (
      <main className="container mx-auto p-6">
        <div className="card-glass rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Browse Popular Genres</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover movies and TV shows by genre
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularGenres.map((genre) => (
              <GenreCard key={genre.id} id={genre.id} name={genre.name} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Fetch search results
  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
  const url = new URL(`/api/search?q=${encodeURIComponent(q)}`, base).toString();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return <div className="p-6">Failed to search</div>;
  const json = await res.json();
  const results = json.results || [];

  return (
    <main className="min-h-screen">
      <div className="card-glass rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Search results for &quot;{q}&quot; {results.length > 0 && `(${results.length} found)`}
        </h1>
        
        {results.length > 0 ? (
          <MovieCardGrid 
            movies={results}
            className="p-0"
          />
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No results found for &quot;{q}&quot;</p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Try a different search term or browse by genre</p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="card-glass rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-gray-200">Popular Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularGenres.map((genre) => (
              <GenreCard key={genre.id} id={genre.id} name={genre.name} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
