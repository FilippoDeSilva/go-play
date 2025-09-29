'use client';

import { Suspense } from 'react';
import InfiniteGrid from '@/components/Search/SearchGrid';

type SearchResultsProps = {
  searchQuery: string;
};

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

export default function SearchResults({ searchQuery }: SearchResultsProps) {
  return (
    <>
      {/* Movies Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">Movies</h2>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <InfiniteGrid 
            query={searchQuery}
            type="movie"
            className="mb-8"
            itemsPerPage={18}
          />
        </Suspense>
      </section>

      {/* TV Shows Section */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">TV Shows</h2>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <InfiniteGrid 
            query={searchQuery}
            type="tv"
            itemsPerPage={18}
          />
        </Suspense>
      </section>
    </>
  );
}
