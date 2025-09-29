import { NextRequest, NextResponse } from 'next/server';
import { Media } from "@/types/TMDBMovie";

export const dynamic = 'force-dynamic'; // Ensure dynamic route handling

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'movie').toLowerCase() as 'movie' | 'tv';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = parseInt(searchParams.get('limit') || '18', 10) || 18;
  
  if (!q) {
    return NextResponse.json(
      { results: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 200 }
    );
  }

  const safeType = type === 'tv' ? 'tv' : 'movie';
  const tmdbUrl = new URL(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/search/${safeType}`);
  tmdbUrl.searchParams.append('language', 'en-US');
  tmdbUrl.searchParams.append('page', page.toString());
  tmdbUrl.searchParams.append('include_adult', 'false');
  tmdbUrl.searchParams.append('query', q);

  try {
    const res = await fetch(tmdbUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 300, // Cache for 5 minutes
        tags: [`search-${q}-${type}`] // Add cache tag for revalidation
      }
    });

    if (!res.ok) {
      throw new Error(`TMDB API returned ${res.status}`);
    }

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

    return NextResponse.json({
      ...data,
      results,
      page,
      total_pages,
      has_more: hasMore,
      total_results: data.total_results || 0
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { 
        results: [], 
        page: 1, 
        total_pages: 0, 
        total_results: 0,
        error: 'Failed to fetch search results'
      },
      { status: 500 }
    );
  }
}
