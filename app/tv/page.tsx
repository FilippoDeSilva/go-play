import React from 'react';
import MediaCard from '@/components/Cards/MediaCard';
import { Media as TVShow } from '@/types/TMDBMovie';

export default async function TVPage() {
 
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
  if (!base) return <div className="p-6">TMDB API not configured.</div>;

  try {
    // Fetch popular TV shows
    const res = await fetch(
      `${base}/tv/popular?language=en-US&page=1`,
      {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` },
        next: { revalidate: 60 * 60 * 24 } // Revalidate daily
      }
    );
    
    if (!res.ok) {
      throw new Error('Failed to fetch TV shows');
    }

    const data = await res.json();
    const tvShows: TVShow[] = data.results || [];
    const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between pt-18 ">
          <h1 className="text-3xl font-extrabold text-indigo-400 dark:text-indigo-500 mb-5">Popular TV Shows</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tvShows.map((show) => (
            <MediaCard
              key={`tv-${show.id}`}
              id={show.id}
              title={show?.name || "N/A"}
              poster_url={show.poster_path ? `${imageBase}${show.poster_path}` : null}
              media_type="tv"
              release_date={show.first_air_date}
              rating={show.vote_average}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error loading TV shows. Please try again later.</div>
      </div>
    );
  }
}
