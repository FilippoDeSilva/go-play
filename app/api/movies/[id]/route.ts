export async function GET(req: Request, context?: unknown) {
  
  // Next may pass params as a plain object or a Promise depending on runtime/types.
  let paramsObj: { id?: string } | undefined;
  if (context && typeof context === 'object' && 'params' in context) {
    const ctx = context as { params?: unknown };
    const p = ctx.params;
    const isThenable = (v: unknown): v is Promise<unknown> => {
      if (typeof v !== 'object' || v === null) return false;
      const thenProp = (v as Record<string, unknown>)['then'];
      return typeof thenProp === 'function';
    };
    if (isThenable(p)) {
      paramsObj = (await p) as { id?: string };
    } else {
      paramsObj = p as { id?: string } | undefined;
    }
  }
  const { id } = paramsObj || {};
  const tmdbUrl = `${process.env.NEXT_PUBLIC_TMDB_API_URL}/movie/${id}/videos?language=en-US`;

  const res = await fetch(tmdbUrl, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch videos' }), { status: 500 });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
