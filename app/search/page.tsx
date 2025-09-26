import React from 'react';
import MovieCardGrid from '@/components/MovieCardGrid';

type Props = { 
  searchParams: { q?: string } 
};

export default async function SearchPage({ searchParams }: Props) {
  // Get the search query from URL params
  const searchQuery = searchParams ? (await searchParams).q || '' : '';
  
  // If no search query, show popular genres
  if (!searchQuery) {
    return (
      <main className="container mx-auto p-6 bg-transparent pt-18">
        <div className="card-glass rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Browse Popular Genres</h1>
          <p className="text-gray-900 dark:text-gray-300 mb-6">
            Discover movies and TV shows by genre
          </p>
          {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularGenres.map((genre) => (
              // <GenreCard key={genre.id} id={genre.id} name={genre.name} />
            ))}
          </div> */}
        </div>
      </main>
    );
  }

  // Fetch search results
  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
  const url = new URL(`/api/search?q=${encodeURIComponent(searchQuery)}`, base).toString();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return <div className="p-6">Failed to search</div>;
  const json = await res.json();
  // Transform results to match the expected Media type
  const results = (json.results || []).map((item: any) => ({
    id: item.id,
    title: item.title || item.name || 'Untitled',
    poster_path: item.poster_path,
    poster_url: item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null),
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    media_type: item.media_type || 'movie',
    overview: item.overview
  }));

  return (
    <main className="min-h-screen">
      <div className="card-glass rounded-xl p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Search results for &quot;{searchQuery}&quot; {results.length > 0 && `(${results.length} found)`}
        </h1>
        
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((movie: any) => (
              <div key={movie.id} className="card-glass rounded-lg overflow-hidden relative group transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-gray-800/30">
                <div className="relative w-full aspect-[2/3]">
                  {movie.poster_url ? (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent dark:from-black/60 pointer-events-none" />
                  <a 
                    href={`/movies/${movie.id}`} 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg transform transition-transform duration-200 group-hover:scale-110">
                      <svg xmlns="http://www.w3.org/20000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                  {movie.release_date && (
                    <div className="absolute top-3 right-3">
                      <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none backdrop-blur-sm">
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{movie.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {movie.vote_average ? `${Math.round(movie.vote_average * 10)}%` : 'N/A'}
                    </p>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                      {movie.media_type === 'tv' ? 'TV' : 'Movie'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">            
              No results found for &quot;{searchQuery}&quot;. Try a different search term. 
              </p>        
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Try a different search term or browse by genre
                </p>
          </div>
        )}
      </div>

      {/* {results.length > 0 && (
{{ ... }}
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-gray-200">Popular Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularGenres.map((genre) => (
              <GenreCard key={genre.id} id={genre.id} name={genre.name} />
            ))}
          </div>
        </div>
      )} */}
    </main>
  );
}
