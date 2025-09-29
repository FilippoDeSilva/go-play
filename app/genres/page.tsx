'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GenreCard from '@/components/Cards/GenreCard';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
  count: number;
}

export default function GenresPage() {
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [visibleGenres, setVisibleGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 18;

  // Load all genres
  const loadAllGenres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
      if (!base) throw new Error('TMDB API not configured');

      const [movieRes, tvRes] = await Promise.all([
        fetch(`${base}/genre/movie/list?language=en-US`, { 
          headers: { 
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
            'Cache-Control': 'no-store'
          }
        }),
        fetch(`${base}/genre/tv/list?language=en-US`, { 
          headers: { 
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
            'Cache-Control': 'no-store'
          }
        })
      ]);

      if (!movieRes.ok || !tvRes.ok) {
        throw new Error('Failed to load genres');
      }

      const movieJson = await movieRes.json();
      const tvJson = await tvRes.json();

      const map = new Map<number, Genre>();
      
      // Helper function to count genre occurrences
      const updateGenreCount = (genres: Array<{ id: number; name: string }>) => {
        genres.forEach((g) => {
          const existing = map.get(g.id) || { ...g, count: 0 };
          map.set(g.id, {
            ...existing,
            count: existing.count + 1
          });
        });
      };

      updateGenreCount(movieJson.genres || []);
      updateGenreCount(tvJson.genres || []);

      // Convert to array and sort by count (most common first) then by name
      const sortedGenres = Array.from(map.values()).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });

      return sortedGenres;
    } catch (err) {
      console.error('Error loading genres:', err);
      setError('Failed to load genres. Please try again later.');
      return [];
    }
  }, []);

  // Update visible genres based on current page
  const updateVisibleGenres = useCallback((genres: Genre[], currentPage: number) => {
    const endIndex = currentPage * itemsPerPage;
    const paginatedGenres = genres.slice(0, endIndex);
    setVisibleGenres(paginatedGenres);
    setHasMore(endIndex < genres.length);
  }, [itemsPerPage]);

  // Initial load
  useEffect(() => {
    const initializeGenres = async () => {
      const loadedGenres = await loadAllGenres();
      if (loadedGenres.length > 0) {
        setAllGenres(loadedGenres);
        updateVisibleGenres(loadedGenres, 1);
      }
      setLoading(false);
    };

    initializeGenres();
  }, [loadAllGenres, updateVisibleGenres]);

  // Handle pagination
  useEffect(() => {
    if (allGenres.length > 0) {
      updateVisibleGenres(allGenres, page);
    }
  }, [page, allGenres, updateVisibleGenres]);

  const loadMore = () => {
    if (!loading) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && visibleGenres.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500 text-center py-12">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-6 bg-transparent pt-18">
      <div className="card-glass rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Browse Popular Genres</h1>
        <p className="text-gray-900 dark:text-gray-300 mb-6">
          Discover movies and TV shows by genre
        </p>
      </div>

      {visibleGenres.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {visibleGenres.map((genre) => (
              <GenreCard 
                key={genre.id} 
                id={genre.id} 
                name={genre.name} 
                className="w-full hover:scale-[1.01] transition-transform duration-200"
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <Button
                onClick={loadMore}
                disabled={loading}
               className="px-6 bg-transparent py-3 text-base font-medium hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                {loading ? 'Loading...' : 'Load More Genres'}
                {!loading && <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No genres found.
        </div>
      )}
    </main>
  );
}
