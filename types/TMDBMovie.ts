export type Media = {
  id?: number;
  tmdbId?: number;
  title?: string;
  name?: string;
  poster_url?: string | null;
  backdrop_path?: string | null;
  poster_path?: string | null;
  seasonNumber?: number;
  episodeNumber?: Number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv' | 'anime';
  className?: string;
  rating?: number | undefined;
};

export type SearchResult = {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    poster_url?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: 'movie' | 'tv';
    overview?: string;
  };

export type GenreCardProps = {
  id: number;
  name: string;
  className?: string;
};

type Creator = {
  id: number;
  name: string;
};

type Network = {
  id: number;
  name: string;
  logo_path: string | null;
};

export type Season = {
  id: number;
  name: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  episodes: Episode[] | [];
  air_date: string;
};

export type Episode = {
  id: number;
  name: string;
  episode_number: number;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
};

export type EpisodeSelector = {
seasons: Season[];
defaultSeason?: number;
defaultEpisode?: number;
};

export type TVShowDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  created_by: Creator[];
  networks: Network[];
  seasons: Season[];
  recommendations?: {
    results: Array<{
      id: number;
      name: string;
      poster_path: string | null;
      vote_average: number;
      first_air_date: string;
    }>;
  };
};

export type Video = { 
    site?: string; 
    type?: string; 
    key?: string; 
    name?: string 
}