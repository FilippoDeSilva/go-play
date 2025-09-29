"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';

export default function Header() {
  const [q, setQ] = useState('');
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme;

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/genres');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setGenres(json.genres || []);
      } catch {
        // ignore
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setGenresOpen(false);
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!dropdownRef.current) return;
      if (target && !dropdownRef.current.contains(target)) setGenresOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setMenuOpen(false);
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }
  
  return (
    <header className="w-full fixed transition-colors backdrop-blur top-0 z-50 bg-white/80 text-slate-900 border-b border-gray-200 dark:bg-slate-900/80 dark:text-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow">GP</span>
          <span className="hidden sm:inline font-semibold tracking-tight">GoPlay</span>
        </Link>

        <form onSubmit={onSubmit} className="hidden md:flex items-center gap-2 flex-1 max-w-xl" role="search" aria-label="Search movies">
          <div className="relative flex-1">
            <label htmlFor="header-search" className="sr-only">Search movies</label>
            <input
              value={q}
              id="header-search"
              onChange={e => setQ(e.target.value)}
              placeholder="Search movies..."
              className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {/* Inline right-side icon: show Clear when there's text, otherwise a submit Search icon */}
            {q ? (
              <button type="button" onClick={() => setQ('')} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                </svg>
              </button>
            ) : (
              <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* removed external submit button: inline icon handles submission */}
        </form>

        <div className="hidden md:flex items-center gap-3">
          <div className="hidden md:flex items-center space-x-4">
            {/* <Link 
              href="/movies" 
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Movies
            </Link>
            <Link 
              href="/tv" 
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              TV Shows
            </Link> */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setGenresOpen(!genresOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                Genres
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {genresOpen && (
                <div className="absolute left-0 mt-2 w-[600px] max-h-[70vh] overflow-y-auto rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4" role="menu">
                    {genres.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading genres...</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {genres.map((genre) => (
                          <Link
                            key={genre.id}
                            href={`/genres/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded whitespace-nowrap overflow-hidden text-ellipsis"
                            role="menuitem"
                            onClick={() => setGenresOpen(false)}
                            title={genre.name}
                          >
                            {genre.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button aria-label="Search" className="md:hidden p-2 rounded-md text-gray-200 hover:bg-white/6 cursor-pointer" onClick={() => setMobileSearchOpen(v => !v)}>
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-white/5 hover:scale-105 transition-transform cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-white" />
            )}
          </button>

          <button aria-label="Menu" className="md:hidden p-2 rounded-md text-gray-200 hover:bg-white/6 cursor-pointer" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={`${currentTheme === 'dark' ? 'md:hidden border-t border-gray-800 bg-slate-900' : 'md:hidden border-t border-gray-200 bg-white'}`}>
          <div className="container mx-auto p-4 flex flex-col gap-3">
            <nav className="flex flex-col gap-2">
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                {/* <h3 className="px-3 py-2 text-xs font-semibold text-gray-500">Genres</h3> */}
                <div className="md:hidden flex flex-col space-y-2">
                  {/* <Link
                    href="/"
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link> */}
                  <Link
                    href="/tv"
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    TV Shows
                  </Link>
                  {genres.length === 0 ? (
                    <div className="text-xs text-gray-400 px-3 py-1">Loading…</div>
                  ) : (
                    genres.map(g => (
                      <Link key={g.id} href={`/genres/${g.id}`} onClick={() => setMenuOpen(false)} className="text-xs px-3 py-1 rounded bg-gray-50 dark:bg-gray-800">{g.name}</Link>
                    ))
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {mobileSearchOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
          <div className="container mx-auto p-4">
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search movies..." className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md">Go</button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
