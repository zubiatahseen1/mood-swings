import type { Movie } from "./types";

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Below this many picks for a mood, there is not enough signal to tune. */
export const MIN_PICKS_TO_TUNE = 3;

/**
 * Counts how often each genre appears in the films you picked for a mood.
 * Those counts are the "taste" the pool is nudged towards.
 */
export function genreWeights(picks: { genre_ids: number[] | null }[]) {
  const weights = new Map<number, number>();
  for (const pick of picks) {
    for (const id of pick.genre_ids ?? []) weights.set(id, (weights.get(id) ?? 0) + 1);
  }
  return weights;
}

/**
 * Smarter picks: re-orders the pool so films sharing genres with your past
 * picks rise towards the front. Randomness still counts for 40%, so results
 * stay varied instead of collapsing into one genre. Already-picked films are dropped.
 */
export function rankByTaste(
  pool: Movie[],
  weights: Map<number, number>,
  excludeIds: Set<number> = new Set(),
  random: () => number = Math.random,
) {
  const remaining = pool.filter((movie) => !excludeIds.has(movie.id));
  if (!weights.size) return remaining;
  const max = Math.max(...weights.values());

  return remaining
    .map((movie) => {
      const affinity = movie.genreIds.reduce((sum, id) => sum + (weights.get(id) ?? 0), 0);
      const normalised = Math.min(affinity / (max * 2), 1);
      return { movie, score: normalised * 0.6 + random() * 0.4 };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ movie }) => movie);
}

/** Removes duplicates that appear on more than one TMDB page. */
export function uniqueMovies(movies: Movie[]) {
  const seen = new Set<number>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
}
