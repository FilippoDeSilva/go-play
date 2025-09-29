'use client';

import React, { useState, useEffect } from 'react';
import { SearchResult, Media } from '@/types/TMDBMovie';
import InfiniteGrid from '@/components/Search/InfiniteGrid';

type Props = { 
  searchParams: { q?: string } 
};

export default function SearchPage({ searchParams }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  
  // Initial load
  useEffect(() => {
    const query = searchParams.q || '';
    setSearchQuery(query);
  }, [searchParams.q]);
  
  // If no search query, show popular genres

  if (!searchQuery) {
    return (
      <main className="container mx-auto p-6 bg-transparent pt-18">
        <div className="card-glass rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Browse Popular Genres</h1>
          <p className="text-gray-900 dark:text-gray-300 mb-6">
            Discover movies and TV shows by genre
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between pt-18 px-2">
        <h1 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 mb-6 tracking-tight">
          Search results for &quot;{searchQuery}&quot;
        </h1>
      </div>

      {/* Movies Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">Movies</h2>
        </div>
        <InfiniteGrid 
          query={searchQuery}
          type="movie"
          className="mb-8"
          itemsPerPage={18}
        />
      </section>

      {/* TV Shows Section */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 tracking-tight">TV Shows</h2>
        </div>
        <InfiniteGrid 
          query={searchQuery}
          type="tv"
          itemsPerPage={18}
        />
      </section>
    </div>
  );
}
