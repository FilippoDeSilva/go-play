import React from 'react';
import MovieCardItem from '@/components/MovieCardItem';
type Props = { searchParams: { q?: string } };

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q || '';
  if (!q) return <div className="p-6">Please provide a search query.</div>;

  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
  const url = new URL(`/api/search?q=${encodeURIComponent(q)}`, base).toString();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return <div className="p-6">Failed to search</div>;
  const json = await res.json();
  const results = json.results || [];

  return (
    <main className="container mx-auto p-6">
      <div className="card-glass rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Search results for &quot;{q}&quot;</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((r: { id: number; title: string; poster_url?: string | null; release_date?: string }) => (
            <MovieCardItem key={r.id} id={r.id} title={r.title} poster_url={r.poster_url} release_date={r.release_date} />
          ))}
        </div>
      </div>
    </main>
  );
}
