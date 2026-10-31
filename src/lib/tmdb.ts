import "server-only";
import { cacheLife } from "next/cache";
import { ApiError, kindForStatus, type ApiErrorKind } from "./errors";
import { MOODS, RUNTIMES, type MoodKey, type RuntimeKey } from "./moods";
import type { TmdbMovieDetails, TmdbPage } from "./types";

/**
 * Server-only TMDB client. The API key lives in a server environment
 * variable and never reaches the browser: the browser only ever talks to
 * this app's own /api routes and server-rendered pages.
 *
 * TMDB_BASE_URL can point at a mock server for end-to-end tests.
 */
const BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";

/**
 * Cached functions return a result instead of throwing, so a failure can be
 * cached briefly (not for hours) and its kind survives the cache boundary.
 */
type Result<T> = { ok: true; data: T } | { ok: false; kind: ApiErrorKind };

type Params = Record<string, string | number | boolean | undefined>;

async function request<T>(path: string, params: Params = {}): Promise<Result<T>> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey === "your_tmdb_api_key") return { ok: false, kind: "config" };

  const url = new URL(BASE_URL + path);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== undefined) url.searchParams.set(key, String(value));
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return { ok: false, kind: kindForStatus(response.status) };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, kind: "network" };
  }
}

/** Throws outside the cached scope, so callers can use try/catch as normal. */
function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new ApiError(result.kind);
  return result.data;
}

async function cachedDiscoverPage(mood: MoodKey, runtime: RuntimeKey, page: number) {
  "use cache";
  const result = await request<TmdbPage>("/discover/movie", {
    sort_by: "popularity.desc",
    include_adult: false,
    "vote_count.gte": 50, // filters out obscure entries with one vote
    with_genres: MOODS[mood].include,
    without_genres: MOODS[mood].exclude,
    page,
    ...RUNTIMES[runtime].params,
  });
  if (result.ok) cacheLife("hours");
  else if (result.kind === "notfound") cacheLife("minutes"); // missing titles: cache briefly
  else cacheLife("seconds"); // outages and rate limits: retry almost immediately
  return result;
}

async function cachedSearch(query: string, page: number) {
  "use cache";
  const result = await request<TmdbPage>("/search/movie", { query, page, include_adult: false });
  if (result.ok) cacheLife("hours");
  else if (result.kind === "notfound") cacheLife("minutes"); // missing titles: cache briefly
  else cacheLife("seconds"); // outages and rate limits: retry almost immediately
  return result;
}

/** One call instead of three: credits and videos ride along with the movie. */
async function cachedMovie(id: number) {
  "use cache";
  const result = await request<TmdbMovieDetails>(`/movie/${id}`, { append_to_response: "credits,videos" });
  if (result.ok) cacheLife("days");
  else if (result.kind === "notfound") cacheLife("minutes"); // missing titles: cache briefly
  else cacheLife("seconds"); // outages and rate limits: retry almost immediately
  return result;
}

/** One page of films for a mood, cached on the server for an hour. */
export const getDiscoverPage = async (mood: MoodKey, runtime: RuntimeKey, page: number) =>
  unwrap(await cachedDiscoverPage(mood, runtime, page));

export const searchMovies = async (query: string, page: number) => unwrap(await cachedSearch(query, page));

export const getMovie = async (id: number) => unwrap(await cachedMovie(id));
