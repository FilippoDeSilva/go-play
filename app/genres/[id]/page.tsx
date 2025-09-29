'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MediaCard from '@/components/Cards/MediaCard';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Media as MediaResult } from '@/types/TMDBMovie';

type Props = { 
  params: { id: string };
  searchParams: { name?: string };
};

type MediaType = 'movie' | 'tv';

interface MediaSectionProps {
  title: string;
  mediaType: MediaType;
  initialItems: any[];
  genreId: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({ title, mediaType, initialItems, genreId }) => {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 20);
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const url = `${base}/discover/${mediaType}?with_genres=${genreId}&language=en-US&page=${nextPage}&sort_by=popularity.desc`;
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
          'Cache-Control': 'no-store'
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch more items');
      
      const data = await res.json();
      const newItems = data.results || [];
      
      setItems(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(!!data.page && data.page < data.total_pages);
    } catch (error) {
      console.error(`Error loading more ${mediaType}s:`, error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, mediaType, genreId, base]);

  const mapPoster = (item: MediaResult) => ({
    id: item.id,
    title: (item.title || item.name || '').toString(),
    poster_url: item.poster_path ? `${imageBase}${item.poster_path}` : null,
    media_type: mediaType,
  });

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const media = mapPoster(item);
          return (
            <MediaCard
              key={`${mediaType}-${media.id}`}
              id={media.id}
              title={media.title}
              poster_url={media.poster_url}
              media_type={mediaType}
            />
          );
        })}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 mx-auto"
          >
            {loading ? 'Loading...' : `Load More ${title}`}
            {!loading && <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </section>
  );
};

export default function GenrePage({ params, searchParams }: Props) {
  const [genreName, setGenreName] = useState(searchParams.name || 'Genre');
  const [initialMovies, setInitialMovies] = useState<MediaResult[]>([]);
  const [initialTV, setInitialTV] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch genre name if not in search params
        if (!searchParams.name) {
          const genreRes = await fetch(`${base}/genre/movie/list?language=en-US`, {
            headers: { 
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
              'Cache-Control': 'no-store'
            },
          });
          const genreData = await genreRes.json();
          const name = genreData.genres?.find((g: { id: number; name: string }) => g.id === Number(params.id))?.name || 'Genre';
          setGenreName(name);
        }

        // Fetch initial data
        const [moviesRes, tvRes] = await Promise.all([
          fetch(`${base}/discover/movie?with_genres=${params.id}&language=en-US&page=1&sort_by=popularity.desc`, { 
            headers: { 
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
              'Cache-Control': 'no-store'
            } 
          }),
          fetch(`${base}/discover/tv?with_genres=${params.id}&language=en-US&page=1&sort_by=popularity.desc`, { 
            headers: { 
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
              'Cache-Control': 'no-store'
            } 
          }),
        ]);

        const moviesJson = moviesRes.ok ? await moviesRes.json() : { results: [] };
        const tvJson = tvRes.ok ? await tvRes.json() : { results: [] };

        setInitialMovies(moviesJson.results || []);
        setInitialTV(tvJson.results || []);
      } catch (error) {
        console.error('Error fetching genre data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, searchParams.name, base]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">{genreName} Title</h1>
      
      <MediaSection 
        title="Popular Movies"
        mediaType="movie"
        initialItems={initialMovies}
        genreId={params.id}
      />
      
      <MediaSection 
        title="TV Shows"
        mediaType="tv"
        initialItems={initialTV}
        genreId={params.id}
      />

      {/* {animeMapped.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Anime</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
{{ ... }}
              <MediaCard
                key={`anime-${media.id}`}
                id={media.id}
                title={media.title}
                poster_url={media.poster_url}
                media_type="anime"
              />
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
}
