import { Media } from "@/types/TMDBMovie";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const type = (url.searchParams.get('type') || 'movie').toLowerCase(); // 'movie' | 'tv'
  const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
  const limit = parseInt(url.searchParams.get('limit') || '18', 10) || 18; // Default to 18 items per page
  
  if (!q) return new Response(JSON.stringify({ results: [], page: 1, total_pages: 0, total_results: 0 }), { headers: { 'Content-Type': 'application/json' } });

  const safeType = type === 'tv' ? 'tv' : 'movie';
  // Request more items than needed in case we need to filter some out
  const itemsToRequest = Math.min(limit * 2, 40); // Don't request more than 40 items at once
  const tmdbUrl = `${process.env.NEXT_PUBLIC_TMDB_API_URL}/search/${safeType}?language=en-US&page=${page}&include_adult=false&query=${encodeURIComponent(q)}`;

  const res = await fetch(tmdbUrl, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) return new Response(JSON.stringify({ results: [], page, total_pages: 0, total_results: 0 }), { status: 500 });

  const data = await res.json();
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
  
  // Process results and apply limit
  const allResults = (data.results || []).map((m: Media) => ({
    ...m,
    media_type: safeType,
    poster_url: m.poster_path ? `${imageBase}${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `${imageBase}${m.backdrop_path}` : null,
  }));

  // Apply limit to the results
  const results = allResults.slice(0, limit);
  
  // Calculate if there are more pages
  const hasMore = (page * limit) < (data.total_results || 0);
  const total_pages = Math.ceil((data.total_results || 0) / limit);

  return new Response(JSON.stringify({ 
    ...data, 
    results,
    page,
    total_pages,
    has_more: hasMore,
    total_results: data.total_results || 0
  }), { 
    headers: { 'Content-Type': 'application/json' } 
  });
}
