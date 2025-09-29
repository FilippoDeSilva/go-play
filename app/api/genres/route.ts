import { NextResponse } from 'next/server';
import { Genre } from '@/types/Genre';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_TMDB_API_URL;
  if (!base) return NextResponse.json({ genres: [] });

  const [
    movieRes, 
    tvRes, 
    // animeRes
  ] = await Promise.all([
    fetch(`${base}/genre/movie/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }, next: { revalidate: 3600 } }),
    fetch(`${base}/genre/tv/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }, next: { revalidate: 3600 } }),
    // fetch(`${base}/genre/anime/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}` }, next: { revalidate: 3600 } }),
  
  ]);

  const movieJson = movieRes.ok ? await movieRes.json() : { genres: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { genres: [] };
  // const animeJson = animeRes.ok ? await animeRes.json() : { genres: [] };

  const map = new Map<number, string>();
  (movieJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));
  (tvJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));
  // (animeJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));

  const genres = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

  return NextResponse.json({ genres });
}
