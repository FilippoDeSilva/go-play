'use client';

import { useState, useEffect } from 'react';
import MovieCardGrid from '@/components/Cards/MovieCardGrid';
import { Media } from '@/types/TMDBMovie';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

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

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No {type === 'movie' ? 'movies' : 'TV shows'} found.
      </div>
    );
  }

  return (
    <div className={className}>
      <MovieCardGrid movies={items} />
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2"
          >
            {isLoadingMore ? (
              <span>Loading...</span>
            ) : (
              <>
                <span>Load More</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}