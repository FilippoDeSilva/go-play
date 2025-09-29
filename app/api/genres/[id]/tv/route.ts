import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = context.params;
  try {
    // id is already extracted from context.params
    const url = `${process.env.NEXT_PUBLIC_TMDB_API_URL}/discover/tv?with_genres=${id}&sort_by=popularity.desc&language=en-US&include_null_first_air_dates=false&page=1&page_size=18`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
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
