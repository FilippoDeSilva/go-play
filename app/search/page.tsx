'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchResults from './search-results';

function SearchResultsWrapper({ searchQuery }: { searchQuery: string }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <SearchResults searchQuery={searchQuery} />;
}

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
        <Suspense 
          key={searchQuery}
          fallback={
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }
        >
          <SearchResultsWrapper searchQuery={searchQuery} />
        </Suspense>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Enter a search term to find movies and TV shows
        </div>
      )}
    </div>
  );
}