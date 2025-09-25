import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.TMDB_API_URL;
  if (!base) return NextResponse.json({ genres: [] });

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${base}/genre/movie/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, next: { revalidate: 3600 } }),
    fetch(`${base}/genre/tv/list?language=en-US`, { headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` }, next: { revalidate: 3600 } }),
  ]);

  const movieJson = movieRes.ok ? await movieRes.json() : { genres: [] };
  const tvJson = tvRes.ok ? await tvRes.json() : { genres: [] };

  type Genre = { id: number; name: string };
  const map = new Map<number, string>();
  (movieJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));
  (tvJson.genres || []).forEach((g: Genre) => map.set(g.id, g.name));

  const genres = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

  return NextResponse.json({ genres });
}
