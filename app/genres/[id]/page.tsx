'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import MediaCard from '@/components/Cards/MediaCard';
import { Button } from '@/components/ui/button';

type MediaType = 'movie' | 'tv';

interface MediaItem {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  [key: string]: any;
}

interface MediaSectionProps {
  title: string;
  mediaType: MediaType;
  initialItems: MediaItem[];
  genreId: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({ title, mediaType, initialItems, genreId }) => {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 20);
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !base) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const url = `${base}/discover/${mediaType}?with_genres=${genreId}&language=en-US&page=${nextPage}&page_size=18&sort_by=popularity.desc`;
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || ''}`,
          'Cache-Control': 'no-store'
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch more items');
      
      const data = await res.json();
      const newItems: MediaItem[] = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title || item.name || 'Untitled',
        name: item.name,
        poster_path: item.poster_path,
        media_type: mediaType,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        vote_average: item.vote_average,
        ...item
      }));
      
      setItems(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(!!data.page && data.page < data.total_pages);
    } catch (error) {
      console.error(`Error loading more ${mediaType}s:`, error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore, mediaType, genreId, base]);

  const mapPoster = (item: MediaItem) => ({
    ...item,
    title: item.title,
    poster_url: item.poster_path ? `${imageBase}${item.poster_path}` : null,
    media_type: mediaType,
  });

  if (items.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-indigo-400 dark:text-indigo-400 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <MediaCard key={`${mediaType}-${item.id}`} {...mapPoster(item)} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:focus-visible:ring-indigo-400/40 rounded-md px-1 hover:cursor-grab"
          >
            {isLoadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <ChevronDown className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default function GenrePage({ params, searchParams }: { params: { id: string }, searchParams: { name?: string } }) {
  const [initialMovies, setInitialMovies] = useState<MediaItem[]>([]);
  const [initialTV, setInitialTV] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genreName, setGenreName] = useState(searchParams?.name || 'Genre');
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!base) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const [moviesRes, tvRes] = await Promise.all([
          fetch(`/api/genres/${params.id}/movies`),
          fetch(`/api/genres/${params.id}/tv`)
        ]);

        if (!moviesRes.ok || !tvRes.ok) {
          throw new Error('Failed to fetch genre data');
        }

        const processMediaItems = (items: any[], type: MediaType): MediaItem[] => 
          (items || [])
            .filter((item: any) => item?.id != null && (item?.title || item?.name))
            .map((item: any) => ({
              id: item.id,
              title: item.title || item.name || 'Untitled',
              name: item.name,
              poster_path: item.poster_path,
              media_type: type,
              release_date: item.release_date,
              first_air_date: item.first_air_date,
              vote_average: item.vote_average,
              ...item
            }));

        const moviesData = await moviesRes.json();
        const tvData = await tvRes.json();

        setInitialMovies(processMediaItems(moviesData.results || [], 'movie'));
        setInitialTV(processMediaItems(tvData.results || [], 'tv'));
      } catch (error) {
        console.error('Error fetching genre data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.id, searchParams?.name]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-indigo-500 dark:text-indigo-500 mb-6">{genreName} Genre</h1>
      
      {initialMovies.length > 0 && (
        <MediaSection 
          title="Popular Movies"
          mediaType="movie"
          initialItems={initialMovies}
          genreId={params?.id || ''}
        />
      )}
      
      {initialTV.length > 0 && (
        <MediaSection 
          title="TV Shows"
          mediaType="tv"
          initialItems={initialTV}
          genreId={params?.id || ''}
        />
      )}
    </div>
  );
}