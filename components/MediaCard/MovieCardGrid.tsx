'use client';

import { Media } from "@/types/TMDBMovie";
import MediaCard from "./MediaCard";

interface MovieCardGridProps {
  movies: Media[];
  title?: string;
  className?: string;
}

export default function MovieCardGrid({ movies, title, className = '' }: MovieCardGridProps) {
  if (movies.length === 0) {
    return null;
  }

  // Helper function to get the release year
  const getReleaseYear = (movie: Media) => {
    const dateStr = movie.release_date || movie.first_air_date || '';
    return dateStr ? new Date(dateStr).getFullYear() : '';
  };

  // Helper function to get the rating percentage
  const getRating = (movie: Media) => {
    if (movie.vote_average === undefined) return 'N/A';
    return `${Math.round(movie.vote_average * 10)}%`;
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
      )}
      
      {/* Responsive grid for all screen sizes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => {
          const releaseYear = getReleaseYear(movie);
          const rating = getRating(movie);
          return (
            <div key={movie.id} className="flex flex-col gap-2">
              <MediaCard {...movie} />
              <div className="px-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{movie.title || movie.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{rating}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{releaseYear}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
