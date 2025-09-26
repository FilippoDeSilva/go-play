"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Media as Movie } from "@/types/TMDBMovie";
import { Loader2 } from "lucide-react";

// Movie card component
const MovieItem = React.memo(({ movie }: { movie: Movie }) => (
  <div className="card-glass rounded-lg overflow-hidden relative group transition-transform duration-300 hover:scale-[1.01]">
    <div className="relative w-full aspect-[2/3]">
      {movie.poster_url ? (
        <Image
          src={movie.poster_url}
          alt={movie.title || 'Movie poster'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent dark:from-black/60 pointer-events-none" />
      
      {/* Play button overlay */}
      <Link 
        href={`/movies/${movie.id}`}
        aria-label={`Open ${movie.title} details`}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
      >
        <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg transform transition-transform duration-200 group-hover:scale-110">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </Link>

      {/* Media type and rating */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
        <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
          <span>Movie</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-amber-400 font-medium rounded-full pointer-events-none">
          <span>★</span>
          <span>{movie.vote_average?.toFixed(1)}</span>
        </div>
      </div>

      {/* Title and release year */}
      <div className="absolute bottom-0 right-0 p-3 pointer-events-none">
        <div className="text-xs text-gray-300">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
        </div>
      </div>
    </div>
  </div>
));

MovieItem.displayName = 'MovieItem';

export default function MovieCard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const mountedRef = useRef(false);

  const fetchMovies = useCallback(async () => {
    try {
      const res = await fetch('/api/movies');
      if (!res.ok) throw new Error('Failed to fetch movies');
      const json = await res.json();
      if (mountedRef.current) {
        setMovies(json.results || []);
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (initialLoad) {
      fetchMovies();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchMovies, initialLoad]);

  // Show loading state only on initial load
  if (loading && movies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-gray-500 dark:text-gray-400 h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between pt-18 px-2">
        <h1 className="text-3xl font-bold text-foreground/90 dark:text-foreground/90 mb-6 tracking-tight">
          Popular Movies
        </h1>
      </div>

      {movies.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No movies found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieItem key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
