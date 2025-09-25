import { TMDBMovie } from "@/types/TMDBMovie";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const p = url.searchParams.get('p') || 1;
  if (!q) return new Response(JSON.stringify({ results: [] }), { headers: { 'Content-Type': 'application/json' } });

  const tmdbUrl = `${process.env.TMDB_API_URL}/search/movie?language=en-US&page=${p}&query=${encodeURIComponent(q)}`;

  const res = await fetch(tmdbUrl, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return new Response(JSON.stringify({ results: [] }), { status: 500 });

  const data = await res.json();
  const imageBase = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
  const results = (data.results || []).map((m: TMDBMovie) => ({
    ...m,
    poster_url: m.poster_path ? `${imageBase}${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `${imageBase}${m.backdrop_path}` : null,
  }));

  return new Response(JSON.stringify({ ...data, results }), { headers: { 'Content-Type': 'application/json' } });
}
