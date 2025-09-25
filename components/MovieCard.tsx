"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { Movie } from "@/types/TMDBMovie";
import { Loader2 } from "lucide-react";


export default function MovieCard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function LoadMovies() {
      try {
        const res = await fetch('/api/movies');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (mounted) setMovies(json.results || []);
      } catch {
          console.error('Failed to load movies');
        } finally {
        if (mounted) setLoading(false);
      }
    }
    LoadMovies();
    return () => { mounted = false };
  }, []);

  const [active, setActive] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance interval: every 5s, advance the small-screen carousel unless paused
  useEffect(() => {
    if (!carouselRef.current || movies.length === 0) return;
    let idx = 0;
    const id = setInterval(() => {
      if (paused) return;
      idx = (idx + 1) % movies.length;
      setCarouselIndex(idx);
      const el = carouselRef.current!;
      const child = el.children[idx] as HTMLElement | undefined;
      if (child) {
        // center the child in the carousel viewport
        const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2;
        el.scrollTo({ left, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [movies.length, paused]);

  // When carouselIndex changes explicitly, scroll to that item
  useEffect(() => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const child = el.children[carouselIndex] as HTMLElement | undefined;
    if (child) {
      const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2;
      el.scrollTo({ left, behavior: 'smooth' });
    }
  }, [carouselIndex]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-600">Popular Movies</h1>

        <div className="flex items-center gap-3">
        </div>
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto text-gray-500 dark:text-gray-400" />
      ) : movies.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No movies found.</p>
      ) : (
        <>
          {/* Carousel layout for small screens, grid for larger */}
          <div
            ref={carouselRef}
            className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-6 px-6 touch-pan-x"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {movies.map((m: Movie) => (
              <div key={m.id} className="snap-center flex-shrink-0 w-full card-glass rounded-lg overflow-hidden relative group">
                <div className="relative w-full h-96">
                  {m.poster_url ? (
                    <Image src={m.poster_url} alt={m.title} fill className="object-fit md:object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent dark:from-black/60 pointer-events-none" />

                  {/* Play overlay: show play icon on hover/tap */}
                  <a href={`/movies/${m.id}`} aria-label={`Open ${m.title} details`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>

                  {/* Date pill top-right (visual only) */}
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full">
                      <span className="truncate">{m.release_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid for medium+ screens */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((m: Movie) => (
              <div key={m.id} className="card-glass rounded-lg overflow-hidden relative group">
                <div className="relative w-full h-96">
                  {m.poster_url ? (
                    <Image src={m.poster_url} alt={m.title} fill className="object-contain md:object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-black/50 pointer-events-none" />

                  {/* Play overlay for grid card (replaces overview) */}
                  <a href={`/movies/${m.id}`} aria-label={`Open ${m.title} details`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>

                  {/* Date pill top-right (visual only) */}
                  <div className="absolute top-3 right-3">
                    <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
                      <span className="truncate">{m.release_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
     
    </div>
  );
}
