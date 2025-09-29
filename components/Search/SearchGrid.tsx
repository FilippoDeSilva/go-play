'use client';

import { useState, useEffect } from 'react';
import MovieCardGrid from '@/components/Cards/MovieCardGrid';
import { Media } from '@/types/TMDBMovie';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

// Skeleton card component for loading state
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}

type Props = {
  query: string;
  type: 'movie' | 'tv';
  className?: string;
  itemsPerPage?: number;
};

export default function SearchGrid({ 
  query, 
  type, 
  className = '',
  itemsPerPage = 18
}: Props) {
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset states when query or type changes
  useEffect(() => {
    const fetchInitial = async () => {
      if (!query) return;
      
      try {
        const url = new URL(
          `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=1&limit=${itemsPerPage}`,
          window.location.origin
        ).toString();
        
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        setItems(data.results || []);
        setHasMore(1 < (data.total_pages || 1));
        setPage(1);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    
    fetchInitial();
  }, [query, type, itemsPerPage]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    const nextPage = page + 1;
    
    try {
      setIsLoadingMore(true);
      const url = new URL(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${nextPage}&limit=${itemsPerPage}`,
        window.location.origin
      ).toString();
      
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch more items');
      
      const data = await res.json();
      setItems(prev => [...prev, ...(data.results || [])]);
      setPage(nextPage);
      setHasMore(nextPage < (data.total_pages || 1));
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!query) {
    return null;
  }

  if (items.length === 0 && !isLoadingMore) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No {type === 'movie' ? 'movies' : 'TV shows'} found.
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Render MovieCardGrid with all items */}
      <MovieCardGrid movies={items} />
      
      {/* Show skeleton loading cards when loading more */}
      {isLoadingMore && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      )}
      {hasMore && !isLoadingMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:focus-visible:ring-indigo-400/40 rounded-md px-1"
          >
            <span>Load More</span>
            <ChevronDown className="w-5 h-5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}