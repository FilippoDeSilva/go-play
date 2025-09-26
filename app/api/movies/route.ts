import { Media } from "@/types/TMDBMovie";

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_API_URL}/movie/popular?language=en-US&page=1`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
    },
    next: { revalidate: 3600 }, // optional caching
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch movies" }), { status: 500 });
  }
  const data = await res.json();

  // Build absolute image URLs because TMDB only returns relative paths (poster_path / backdrop_path)
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL!;


  const results = (data.results || []).map((m: Media) => ({
    ...m,
    poster_url: m.poster_path ? `${imageBase}${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `${imageBase}${m.backdrop_path}` : null,
  }));

  return new Response(JSON.stringify({ ...data, results }), {
    headers: { "Content-Type": "application/json" },
  });
}
