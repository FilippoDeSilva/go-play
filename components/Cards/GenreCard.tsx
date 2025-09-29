import React from 'react';
import Link from 'next/link';
import { GenreCardProps } from '@/types/TMDBMovie';

export default function GenreCard({ id, name, className = '' }: GenreCardProps) {
  return (
    <Link 
      href={`/genres/${id}?name=${encodeURIComponent(name)}`}
      className={`${className} group card-glass rounded-lg overflow-hidden relative h-32 flex items-center justify-center transition-all duration-300 hover:scale-105`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 text-center p-4 w-full">
        <h3 className="text-lg font-bold text-white drop-shadow-md">{name}</h3>
        <div className="mt-2 inline-flex items-center text-sm text-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Explore</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
