import { ApiError, type ApiErrorKind } from "./errors";
import { shuffle } from "./pool";
import type { MoodKey, RuntimeKey } from "./moods";
import type { MoviePage } from "./types";

/** Browser-side fetchers for this app's own API routes. */
async function getJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError("network");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: ApiErrorKind };
    throw new ApiError(body.error ?? "server");
  }
  return response.json() as Promise<T>;
}

/**
 * One batch of the mood pool, shuffled in the browser so every visitor
 * gets their own order even though the server caches the raw pages.
 */
export async function fetchMoodBatch(mood: MoodKey, runtime: RuntimeKey, batch: number) {
  const params = new URLSearchParams({ mood, runtime, batch: String(batch) });
  const data = await getJson<MoviePage>(`/api/discover?${params}`);
  return { ...data, movies: shuffle(data.movies) };
}

export function fetchSearchPage(q: string, page: number) {
  const params = new URLSearchParams({ q, page: String(page) });
  return getJson<MoviePage>(`/api/search?${params}`);
}
