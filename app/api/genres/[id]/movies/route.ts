import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Genre ID is required' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/discover/movie`);
    url.searchParams.append('with_genres', id);
    url.searchParams.append('sort_by', 'popularity.desc');
    url.searchParams.append('language', 'en-US');
    url.searchParams.append('page', '1');
    url.searchParams.append('page_size', '18');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: [`genre-movies-${id}`] // Add cache tag for revalidation
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movies by genre');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/genres/[id]/movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies by genre' },
      { status: 500 }
    );
  }
}
