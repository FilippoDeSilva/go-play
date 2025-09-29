'use client';

import React, { useState, useEffect } from 'react';
import MovieCardGrid from '@/components/Cards/MovieCardGrid';
import { Media } from '@/types/TMDBMovie';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

type Props = {
  query: string;
  type: 'movie' | 'tv';
  className?: string;
  itemsPerPage?: number;
  onLoadComplete?: () => void;
};

export default function SearchGrid({ 
  query, 
  type, 
  className = '',
  itemsPerPage = 18,
  onLoadComplete
}: Props) {
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch initial data when query or type changes
  useEffect(() => {
    const fetchInitial = async () => {
      if (!query) return;
      
      try {
        setLoading(prev => ({ ...prev, initial: true }));
        const url = new URL(
          `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=1&limit=${itemsPerPage}`,
          window.location.origin
        ).toString();
        
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        const results = data.results || [];
        
        setItems(results);
        setPage(1);
        setTotalPages(data.total_pages || 1);
        setHasMore(1 < (data.total_pages || 1));
        
        // Notify parent that initial load is complete
        if (onLoadComplete) {
          onLoadComplete();
        }
      } catch (error) {
        console.error('Error fetching initial items:', error);
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    
    fetchInitial();
  }, [query, type, itemsPerPage]);

  const loadMore = async () => {
    if (loading.more || !hasMore) return;
    
    const nextPage = page + 1;
    
    try {
      setLoading(prev => ({ ...prev, more: true }));
      
      const url = new URL(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${nextPage}&limit=${itemsPerPage}`,
        window.location.origin
      ).toString();
      
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch more items');
      
      const data = await res.json();
      const newItems = data.results || [];
      
      setItems(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(nextPage < (data.total_pages || 1));
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(prev => ({ ...prev, more: false }));
    }
  };

  if (loading.initial) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
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
        <div className="mt-8 text-center">
          <Button 
            onClick={loadMore}
            disabled={loading.more}
            className="px-6 bg-transparent py-3 text-base font-medium hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            {loading.more ? 'Loading...' : `Show More ${type === 'movie' ? 'Movies' : 'TV Shows'}`}
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          No more {type === 'movie' ? 'movies' : 'TV shows'} to show
        </div>
      )}
    </div>
  );
}
