'use client';

import { Media } from "@/types/TMDBMovie";
import MediaCard from "./MediaCard";

interface MovieCardGridProps {
  movies: Media[];
  className?: string;
}

export default function MovieCardGrid({ movies, className = '' }: MovieCardGridProps) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Responsive grid for all screen sizes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="w-full">
            <MediaCard {...movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
