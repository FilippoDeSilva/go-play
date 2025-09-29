// app/search/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// This is the client-side search page component
function SearchPageClient() {
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
        <div className="space-y-16">
          {/* Movies Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">Movies</h2>
            </div>
            {/* Your SearchGrid component here */}
            {/* <SearchGrid query={searchQuery} type="movie" itemsPerPage={18} /> */}
          </section>

          {/* TV Shows Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">TV Shows</h2>
            </div>
            {/* Your SearchGrid component here */}
            {/* <SearchGrid query={searchQuery} type="tv" itemsPerPage={18} /> */}
          </section>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Enter a search term to find movies and TV shows
        </div>
      )}
    </div>
  );
}

// The actual page — Server Component
export default function Page() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      {/* This Client Component is defined above, not imported from another file */}
      <SearchPageClient />
    </Suspense>
  );
}
