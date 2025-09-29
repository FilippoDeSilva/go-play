import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

type RouteParams = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Genre ID is required' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/discover/tv`);
    url.searchParams.append('with_genres', id);
    url.searchParams.append('sort_by', 'popularity.desc');
    url.searchParams.append('language', 'en-US');
    url.searchParams.append('include_null_first_air_dates', 'false');
    url.searchParams.append('page', '1');
    url.searchParams.append('page_size', '18');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: [`genre-tv-${id}`] // Add cache tag for revalidation
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch TV shows by genre');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/genres/[id]/tv:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV shows by genre' },
      { status: 500 }
    );
  }
}
