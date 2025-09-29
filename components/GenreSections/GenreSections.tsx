import React from 'react'
import Link from 'next/link'
import MediaCard from '@/components/Cards/MediaCard'
import { ArrowRightIcon } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3'
const TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN || ''

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        next: { revalidate: 60 * 30 },
    })
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return res.json()
}

async function getGenres(type: 'movie' | 'tv') {
    return fetchJson<{ genres: Array<{ id: number; name: string }> }>(
        `${API}/genre/${type}/list?language=en-US`
    )
}

type TMDBResult = {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
};

async function getDiscover(type: 'movie' | 'tv', genreId: number) {
    return fetchJson<{ results: TMDBResult[] }>(
        `${API}/discover/${type}?language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=1`
    )
}

function mapToMedia(item: TMDBResult, media_type: 'movie' | 'tv') {
    return {
        id: item.id,
        title: media_type === 'movie' ? item.title : undefined,
        name: media_type === 'tv' ? item.name : undefined,
        poster_path: item.poster_path,
        media_type,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
    }
}

export default async function GenreSections() {
    // Fetch genres for movie and tv
    const [movieGenres, tvGenres] = await Promise.all([
        getGenres('movie').catch(() => ({ genres: [] })),
        getGenres('tv').catch(() => ({ genres: [] })),
    ])

    // Pick a few top genres to avoid too many requests
    const topMovieGenres = movieGenres.genres.slice(0, 4)
    const topTvGenres = tvGenres.genres.slice(0, 4)

    // Fetch discover lists in parallel
    const [movieLists, tvLists] = await Promise.all([
        Promise.all(topMovieGenres.map(g => getDiscover('movie', g.id).catch(() => ({ results: [] })))),
        Promise.all(topTvGenres.map(g => getDiscover('tv', g.id).catch(() => ({ results: [] }))))
    ])

    return (
        <div className="container mx-auto p-4 sm:p-6 pt-18">
            {/* Movies by Genre */}
            {topMovieGenres.length > 0 && (
                <section className="mb-10 sm:mb-12">
                    <h2 className="lg:pt-18 md:pt-18 text-xl sm:text-2xl font-bold mb-4 text-indigo-400 dark:text-indigo-400">Movies by Genre</h2>
                    {topMovieGenres.map((g, idx) => (
                        <div key={g.id} className="mb-6 card-glass rounded-xl border border-gray-200/40 dark:border-gray-700/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-indigo-400 dark:text-indigo-400">
                                    {g.name}
                                </h3>
                                <Link
                                    href={`/genres/${g.id}?name=${encodeURIComponent(g.name)}`}
                                    aria-label={`More in ${g.name}`}
                                    className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:focus-visible:ring-indigo-400/40 rounded-md px-1"
                                >
                                    <span>More</span>
                                    <ArrowRightIcon className="w-5 h-5 ml-1" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                                {(movieLists[idx]?.results || []).slice(0, 18).map((m: TMDBResult) => (
                                    <MediaCard key={m.id} {...mapToMedia(m, 'movie')} />
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* TV Shows by Genre */}
            {topTvGenres.length > 0 && (
                <section className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-indigo-400 dark:text-indigo-400">TV Shows by Genre</h2>
                    {topTvGenres.map((g, idx) => (
                        <div key={g.id} className="mb-6 card-glass rounded-xl border border-gray-200/40 dark:border-gray-700/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-indigo-400 dark:text-indigo-400">{g.name}</h3>
                                <Link
                                    href={`/genres/${g.id}?name=${encodeURIComponent(g.name)}`}
                                    aria-label={`More in ${g.name}`}
                                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:focus-visible:ring-indigo-400/40 rounded-md px-1"
                                >
                                    <span>More</span>
                                    <ArrowRightIcon className="w-5 h-5 ml-1" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                                {(tvLists[idx]?.results || []).slice(0, 18).map((t: TMDBResult) => (
                                    <MediaCard key={t.id} {...mapToMedia(t, 'tv')} />
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    )
}
