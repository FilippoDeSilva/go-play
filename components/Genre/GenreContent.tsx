'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Media } from '@/types/TMDBMovie';
import MediaCard from '../Cards/MediaCard';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';

type MediaType = 'movie' | 'tv';

const GenreContent = ({ genreId, genreName }: { genreId: string; genreName: string }) => {
  const [media, setMedia] = useState<{ [key in MediaType]: Media[] }>({ movie: [], tv: [] });
  const [page, setPage] = useState<{ [key in MediaType]: number }>({ movie: 1, tv: 1 });
  const [loading, setLoading] = useState<{ [key in MediaType]: { initial: boolean; more: boolean } }>({ 
    movie: { initial: true, more: false }, 
    tv: { initial: true, more: false } 
  });
  const [hasMore, setHasMore] = useState<{ [key in MediaType]: boolean }>({ movie: false, tv: false });
  const [totalPages, setTotalPages] = useState<{ [key in MediaType]: number }>({ movie: 1, tv: 1 });
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  const fetchMedia = useCallback(async (type: MediaType, pageNum: number) => {
    const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
    if (!base) return { items: [], totalPages: 1 };

    try {
      const url = new URL(
        `${base}/discover/${type}?with_genres=${genreId}&language=en-US&page=${pageNum}&sort_by=popularity.desc`,
        window.location.origin
      ).toString();
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
          'Cache-Control': 'no-store'
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch ${type}s`);
      
      const data = await res.json();
      const results = data.results || [];
      
      return {
        items: results.map((item: Media) => ({
          ...item,
          media_type: type,
          title: item.title || item.name || '',
          poster_url: item.poster_path ? `${imageBase}${item.poster_path}` : null,
        })),
        totalPages: data.total_pages || 1
      };
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
      return { items: [], totalPages: 1 };
    }
  }, [genreId, imageBase]);

  const loadInitialData = useCallback(async () => {
    try {
      const [moviesData, tvData] = await Promise.all([
        fetchMedia('movie', 1),
        fetchMedia('tv', 1)
      ]);

      setMedia({ 
        movie: moviesData.items, 
        tv: tvData.items 
      });
      
      setTotalPages({
        movie: moviesData.totalPages,
        tv: tvData.totalPages
      });
      
      setHasMore({ 
        movie: 1 < moviesData.totalPages, 
        tv: 1 < tvData.totalPages 
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading({
        movie: { initial: false, more: false },
        tv: { initial: false, more: false }
      });
    }
  }, [fetchMedia]);

  const loadMore = useCallback(async (type: MediaType) => {
    if (loading[type].more || !hasMore[type]) return;
    
    try {
      setLoading(prev => ({
        ...prev,
        [type]: { ...prev[type], more: true }
      }));
      
      const nextPage = page[type] + 1;
      const { items: newItems, totalPages } = await fetchMedia(type, nextPage);
      
      if (newItems.length > 0) {
        setMedia(prev => ({
          ...prev,
          [type]: [...prev[type], ...newItems]
        }));
        
        setPage(prev => ({
          ...prev,
          [type]: nextPage
        }));
        
        setHasMore(prev => ({
          ...prev,
          [type]: nextPage < totalPages
        }));
      }
    } catch (error) {
      console.error(`Error loading more ${type}s:`, error);
    } finally {
      setLoading(prev => ({
        ...prev,
        [type]: { ...prev[type], more: false }
      }));
    }
  }, [fetchMedia, hasMore, loading, page]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const renderMediaSection = (type: MediaType) => {
    const items = media[type];
    const isLoading = loading[type];
    const showMore = hasMore[type];
    const typeName = type === 'movie' ? 'Movies' : 'TV Shows';

    if (isLoading.initial && items.length === 0) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No {typeName.toLowerCase()} found in this genre.
        </div>
      );
    }

    return (
      <section className="mb-12">
        {/* <h2 className="text-2xl font-bold mb-6 text-white dark:text-white">
          {typeName} in {genreName}
        </h2> */}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <MediaCard
              key={`${type}-${item.id}`}
              id={item.id}
              title={item.title}
              poster_url={item.poster_url}
              media_type={type}
              release_date={type === 'movie' ? item.release_date : item.first_air_date}
              rating={item.vote_average}
            />
          ))}
        </div>

        {showMore && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => loadMore(type)}
              disabled={isLoading.more}
              className="px-6 bg-transparent py-3 text-base font-medium hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              {isLoading.more ? 'Loading...' : `Show More ${typeName}`}
              {!isLoading.more && <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        )}
        
        {!showMore && items.length > 0 && (
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            No more {typeName.toLowerCase()} to show
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-white dark:text-white">
        {genreName} Genre
      </h1>
      
      {renderMediaSection('movie')}
      {renderMediaSection('tv')}
    </div>
  );
};

export default GenreContent;
