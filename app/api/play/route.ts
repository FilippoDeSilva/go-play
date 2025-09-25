// app/api/play/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // movie | tv | anime
  const tmdbId = searchParams.get("tmdbId");
  const malId = searchParams.get("malId");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const number = searchParams.get("number"); // for anime
  const subOrDub = searchParams.get("subOrDub"); // for anime (sub | dub)

  let url = "";

  if (type === "movie" && tmdbId) {
    url = `https://vidlink.pro/movie/${tmdbId}`;
  } else if (type === "tv" && tmdbId && season && episode) {
    url = `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
  } else if (type === "anime" && malId && number && subOrDub) {
    url = `https://vidlink.pro/anime/${malId}/${number}/${subOrDub}`;
  } else {
    return new Response(
      JSON.stringify({ error: "Invalid parameters" }),
      { status: 400 }
    );
  }

  // Example customization — could be passed as query params
  const params = new URLSearchParams({
    primaryColor: "63b8bc",
    secondaryColor: "a2a2a2",
    iconColor: "eefdec",
    icons: "default",
    title: "true",
    poster: "true",
    autoplay: "false",
    nextbutton: "true",
  });

  return new Response(JSON.stringify({ url: `${url}?${params}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
