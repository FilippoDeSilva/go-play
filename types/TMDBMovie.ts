export type TMDBMovie = { 
    poster_path?: string | null; 
    backdrop_path?: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
 } & Record<string, unknown>;

export type Movie = {
  id: number;
  title: string;
  poster_url: string | null;
  poster_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};