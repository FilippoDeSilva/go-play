'use client';

import React from 'react';
import MovieCardGrid from '@/components/Cards/MovieCardGrid';
import { Media } from '@/types/TMDBMovie';

type Props = {
  query: string;
  type: 'movie' | 'tv';
  initialItems: Media[];
  initialPage: number;
  totalPages: number;
  className?: string;
};

export default function InfiniteGrid({ query, type, initialItems, initialPage, totalPages, className = '' }: Props) {
  const [items, setItems] = React.useState<Media[]>(initialItems);
  const [page, setPage] = React.useState<number>(initialPage);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState<boolean>(initialPage < totalPages);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setItems(initialItems);
    setPage(initialPage);
    setHasMore(initialPage < totalPages);
  }, [initialItems, initialPage, totalPages]);

  React.useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(async (entries) => {
      const first = entries[0];
      if (first.isIntersecting && !loading) {
        setLoading(true);
        try {
          const hdrs = await (async () => {
            // Build base from window since this is client side
            if (typeof window !== 'undefined') return { host: window.location.host, protocol: window.location.protocol.replace(':','') };
            return { host: '', protocol: 'https' };
          })();
          const protocol = hdrs.protocol || (process.env.NEXT_PUBLIC_VERCEL ? 'https' : 'http');
          const base = protocol + '://' + (hdrs.host || '');
          const nextPage = page + 1;
          const url = new URL(`/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${nextPage}`, base).toString();
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            const newItems = (json.results || []) as Media[];
            const sorted = [...items, ...newItems].sort((a, b) => {
              const ar = a.vote_average ?? 0;
              const br = b.vote_average ?? 0;
              if (br !== ar) return br - ar; // higher rating first
              const ad = type === 'tv' ? (a.first_air_date ? new Date(a.first_air_date).getTime() : 0) : (a.release_date ? new Date(a.release_date).getTime() : 0);
              const bd = type === 'tv' ? (b.first_air_date ? new Date(b.first_air_date).getTime() : 0) : (b.release_date ? new Date(b.release_date).getTime() : 0);
              return bd - ad; // newer first
            });
            setItems(sorted);
            setPage(nextPage);
            setHasMore(nextPage < (json.total_pages || totalPages));
          } else {
            setHasMore(false);
          }
        } catch {
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }
    }, { rootMargin: '600px 0px' });

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, page, query, type, totalPages, items]);

  return (
    <div className={className}>
      <MovieCardGrid movies={items} />
      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <div className="py-6 text-center text-sm text-slate-500">Loading more...</div>
      )}
    </div>
  );
}
