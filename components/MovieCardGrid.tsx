'use client';

import Image from "next/image";
import { Movie } from "@/types/TMDBMovie";

interface MovieCardGridProps {
  movies: Movie[];
  title?: string;
  className?: string;
}

export default function MovieCardGrid({ movies, title, className = '' }: MovieCardGridProps) {
  if (movies.length === 0) {
    return null;
  }

  // Helper function to get the poster URL
  const getPosterUrl = (movie: Movie) => {
    if (movie.poster_url) return movie.poster_url;
    if (movie.poster_path) return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    return null;
  };

  // Helper function to get the release year
  const getReleaseYear = (movie: Movie) => {
    const dateStr = movie.release_date || movie.first_air_date || '';
    return dateStr ? new Date(dateStr).getFullYear() : '';
  };

  // Helper function to get the rating percentage
  const getRating = (movie: Movie) => {
    if (movie.vote_average === undefined) return 'N/A';
    return `${Math.round(movie.vote_average * 10)}%`;
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-600">{title}</h1>
        </div>
      )}
      
      {/* Grid for medium+ screens */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => {
          const posterUrl = getPosterUrl(movie);
          const releaseYear = getReleaseYear(movie);
          const rating = getRating(movie);
          
          return (
            <div key={movie.id} className="card-glass rounded-lg overflow-hidden relative group">
              <div className="relative w-full aspect-[2/3]">
                {posterUrl ? (
                  <Image 
                    src={posterUrl} 
                    alt={movie.title} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-black/50 pointer-events-none" />

                {/* Play overlay */}
                <a 
                  href={`/movies/${movie.id}`} 
                  aria-label={`Open ${movie.title} details`} 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
                >
                  <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </a>

                {/* Release year */}
                {releaseYear && (
                  <div className="absolute top-3 right-3">
                    <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
                      <span className="truncate">{releaseYear}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{movie.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {rating}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel for mobile */}
      <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-6 px-6 touch-pan-x">
        {movies.map((movie) => {
          const posterUrl = getPosterUrl(movie);
          const releaseYear = getReleaseYear(movie);
          const rating = getRating(movie);
          
          return (
            <div key={movie.id} className="snap-center flex-shrink-0 w-48 card-glass rounded-lg overflow-hidden relative group">
              <div className="relative w-full aspect-[2/3]">
                {posterUrl ? (
                  <Image 
                    src={posterUrl} 
                    alt={movie.title} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-black/50 pointer-events-none" />

                <a 
                  href={`/movies/${movie.id}`} 
                  aria-label={`Open ${movie.title} details`} 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
                >
                  <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </a>

                {releaseYear && (
                  <div className="absolute top-3 right-3">
                    <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
                      <span className="truncate">{releaseYear}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{movie.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {rating}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
