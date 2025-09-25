import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type MediaCardProps = {
  id: number;
  title: string;
  posterUrl: string | null;
  mediaType: 'movie' | 'tv' | 'anime';
  className?: string;
  releaseDate?: string;
  rating?: number;
};

export default function MediaCard({ 
  id, 
  title, 
  posterUrl, 
  mediaType, 
  className = '',
  releaseDate,
  rating
}: MediaCardProps) {
  return (
    <div className={`${className} card-glass rounded-lg overflow-hidden relative group transition-transform duration-300 hover:scale-[1.01]`}>
      <div className="relative w-full aspect-[2/3]">
        {posterUrl ? (
          <Image 
            src={posterUrl} 
            alt={title} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent dark:from-black/60 pointer-events-none" />

        {/* Play overlay */}
        <Link 
          href={`/${mediaType === 'movie' ? 'movies' : 'tv'}/${id}`} 
          aria-label={`Open ${title} details`} 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
        >
          <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg transform transition-transform duration-200 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </Link>

        {/* Media type and rating */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
            <span className="truncate">{mediaType === 'movie' ? 'Movie' : mediaType === 'tv' ? 'TV Show' : 'Anime'}</span>
          </div>
          {rating !== undefined && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-amber-400 font-semibold rounded-full pointer-events-none">
              <span>★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Release date */}
        {releaseDate && (
          <div className="absolute bottom-14 left-3 right-3">
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
              <span>{new Date(releaseDate).getFullYear() || ''}</span>
            </div>
          </div>
        )}

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white drop-shadow-md line-clamp-2">{title}</h3>
        </div>
      </div>
    </div>
  );
}
