import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; seasonNumber: string }> }
) {
  const { id, seasonNumber } = await context.params;
  
  if (!process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'TMDB API not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_TMDB_API_URL}/tv/${id}/season/${seasonNumber}?language=en-US`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch season details');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching season details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch season details' },
      { status: 500 }
    );
  }
}
