export interface PlayProps {
  type: "movie" | "tv" | "anime";
  tmdbId?: string;
  malId?: string;
  season?: string;
  episode?: string;
  number?: string;    // for anime
  subOrDub?: "sub" | "dub"; // for anime
}