import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Media } from '@/types/TMDBMovie';

export default function MediaCard(props: Media) {
  const {
    id,
    title,
    name,
    poster_url,
    poster_path,
    media_type,
    className = '',
    release_date,
    first_air_date,
    vote_average,
    rating,
  } = props;

  const displayTitle = title || name || 'Untitled';
  const poster = poster_url || (poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null);
  const yearSrc = release_date || first_air_date;
  const year = yearSrc ? new Date(yearSrc).getFullYear() : undefined;
  const displayRating = rating ?? vote_average;
  const href = `/${media_type === 'tv' ? 'tv' : 'movies'}/${id}`;

  return (
    <div className={`${className} card-glass rounded-lg overflow-hidden relative group transition-transform duration-300 hover:scale-[1.01]`}>
      <div className="relative w-full aspect-[2/3]">
        {poster ? (
          <Image
            src={poster}
            alt={displayTitle}
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
        {id !== undefined && (
          <Link
            href={href}
            aria-label={`Open ${displayTitle} details`}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
          >
            <div className="bg-black/60 dark:bg-black/70 p-3 rounded-full shadow-lg transform transition-transform duration-200 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </Link>
        )}

        {/* Media type and rating */}
        {/* <div className="absolute top-3 left-3 right-3 flex justify-between items-start"> */}
          {/* <div className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
            <span className="truncate">{typeLabel}</span>
          </div> */}
          {displayRating !== undefined && (
            <div className="absolute right-0.5 top-0.5 inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-amber-400 font-semibold rounded-full pointer-events-none">
              <span>★</span>
              <span>{displayRating.toFixed(1)}</span>
            </div>
          )}
        {/* </div> */}

        {/* Release year */}
        {year && (
          <div className="absolute bottom-0.5 right-0.5">
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-black/50 dark:bg-black/60 text-white rounded-full pointer-events-none">
              <span>{year}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
