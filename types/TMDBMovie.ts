export type TMDBMovie = { 
    poster_path?: string | null; 
    backdrop_path?: string | null
 } & Record<string, unknown>;

 export type Movie = {
   id: number;
   title: string;
   poster_url: string | null;
   overview?: string;
  release_date?: string;
  first_air_date?: string;
 };