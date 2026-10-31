/**
 * The app's own Movie shape. TMDB's JSON is translated into this once,
 * at the boundary, so nothing else touches `poster_path` or `vote_average`.
 */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  year: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  rating: string | null;
  genreIds: number[];
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbPage {
  page: number;
  total_pages: number;
  results: TmdbMovie[];
}

export interface TmdbMovieDetails extends TmdbMovie {
  runtime: number | null;
  tagline: string | null;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: { key: string; site: string; type: string; official: boolean }[];
  };
}

/** What /api/discover and /api/search return. */
export interface MoviePage {
  movies: Movie[];
  page: number;
  totalPages: number;
}

export function toMovie(json: TmdbMovie): Movie {
  return {
    id: json.id,
    title: json.title,
    overview: json.overview,
    year: json.release_date ? json.release_date.slice(0, 4) : null,
    posterPath: json.poster_path,
    backdropPath: json.backdrop_path ?? null,
    rating: json.vote_average ? json.vote_average.toFixed(1) : null,
    genreIds: json.genre_ids ?? [],
  };
}

const IMG_URL = "https://image.tmdb.org/t/p";

export function imageUrl(path: string | null | undefined, size = "w342") {
  return path ? `${IMG_URL}/${size}${path}` : null;
}

export function runtimeLabel(minutes: number | null | undefined) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
