"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Media as Movie } from "@/types/TMDBMovie";
import { Loader2 } from "lucide-react";
import MediaCard from "./MediaCard";

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
      <div className="flex justify-center items-center pt-[50vh]">
        <Loader2 className="animate-spin text-gray-500 dark:text-gray-400 h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="flex items-center justify-between pt-18 px-2">
        <h1 className="text-3xl font-bold text-indigo-400 dark:text-indigo-500 mb-6 tracking-tight">
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
            <MediaCard key={movie.id} {...movie} />
          ))}
        </div>
      )}
    </div>
  );
}
