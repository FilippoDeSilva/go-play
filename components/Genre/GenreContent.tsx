'use client';

import React, { useState, useEffect } from 'react';
import { Media } from '@/types/TMDBMovie';
import MediaCard from '../Cards/MediaCard';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';

type MediaType = 'movie' | 'tv';

const GenreContent = ({ genreId, genreName }: { genreId: string; genreName: string }) => {
  const [media, setMedia] = useState<{ [key in MediaType]: Media[] }>({ movie: [], tv: [] });
  const [page, setPage] = useState<{ [key in MediaType]: number }>({ movie: 1, tv: 1 });
  const [loading, setLoading] = useState<{ [key in MediaType]: boolean }>({ movie: true, tv: true });
  const [hasMore, setHasMore] = useState<{ [key in MediaType]: boolean }>({ movie: true, tv: true });
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  const fetchMedia = async (type: MediaType, pageNum: number) => {
    const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
    if (!base) return [];

    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      
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
      
      return results.map((item: any) => ({
        ...item,
        media_type: type,
        title: item.title || item.name || '',
        poster_url: item.poster_path ? `${imageBase}${item.poster_path}` : null,
      }));
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const loadInitialData = async () => {
    const [movies, tvShows] = await Promise.all([
      fetchMedia('movie', 1),
      fetchMedia('tv', 1)
    ]);

    setMedia({ movie: movies, tv: tvShows });
    setPage({ movie: 1, tv: 1 });
    setHasMore({ 
      movie: movies.length > 0, 
      tv: tvShows.length > 0 
    });
  };

  const loadMore = async (type: MediaType) => {
    if (loading[type] || !hasMore[type]) return;
    
    const nextPage = page[type] + 1;
    const newItems = await fetchMedia(type, nextPage);
    
    if (newItems.length > 0) {
      setMedia(prev => ({
        ...prev,
        [type]: [...prev[type], ...newItems]
      }));
      setPage(prev => ({
        ...prev,
        [type]: nextPage
      }));
    } else {
      setHasMore(prev => ({
        ...prev,
        [type]: false
      }));
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [genreId]);

  const renderMediaSection = (type: MediaType) => (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-indigo-400 dark:text-indigo-500">
        {type === 'movie' ? 'Movies' : 'TV Shows'} in {genreName}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {media[type].map((item) => (
          <MediaCard
            key={`${type}-${item.id}`}
            id={item.id}
            title={item.title || item.name || ''}
            poster_url={item.poster_path ? `${imageBase}${item.poster_path}` : null}
            media_type={type}
            release_date={type === 'movie' ? item.release_date : item.first_air_date}
            rating={item.vote_average}
          />
        ))}
      </div>

      {hasMore[type] && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => loadMore(type)}
            disabled={loading[type]}
            className="px-6 bg-transparent py-3 text-base font-medium hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            {loading[type] ? (
              'Loading...'
            ) : (
              <>
                Show More {type === 'movie' ? 'Movies' : 'TV Shows'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-indigo-400 dark:text-indigo-500">
        {genreName} Genre
      </h1>
      
      {renderMediaSection('movie')}
      {renderMediaSection('tv')}
    </div>
  );
};

export default GenreContent;
