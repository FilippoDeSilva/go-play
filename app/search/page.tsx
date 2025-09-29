'use client';

import { useSearchParams } from 'next/navigation';
import SearchResults from './search-results';
import { Suspense } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 mb-6 tracking-tight">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Search'}
        </h1>
      </div>

      {searchQuery ? (
        <Suspense fallback={<div>Loading...</div>}>
          <SearchResults searchQuery={searchQuery} />
        </Suspense>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Enter a search term to find movies and TV shows
        </div>
      )}
    </div>
  );
}