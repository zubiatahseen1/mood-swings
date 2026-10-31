import { describe, expect, it } from "vitest";
import { genreWeights, rankByTaste, shuffle, uniqueMovies } from "./pool";
import type { Movie } from "./types";

const movie = (id: number, genreIds: number[]): Movie => ({
  id,
  title: `Movie ${id}`,
  overview: "",
  year: "2020",
  posterPath: "/p.jpg",
  backdropPath: null,
  rating: "7.0",
  genreIds,
});

/** A repeatable "random" sequence so ranking tests are deterministic. */
const fixedRandom = (value: number) => () => value;

describe("shuffle", () => {
  it("keeps every item and does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("genreWeights", () => {
  it("counts how often each genre appears across picks", () => {
    const weights = genreWeights([{ genre_ids: [35, 18] }, { genre_ids: [35] }, { genre_ids: null }]);
    expect(weights.get(35)).toBe(2);
    expect(weights.get(18)).toBe(1);
    expect(weights.size).toBe(2);
  });
});

describe("rankByTaste", () => {
  const pool = [movie(1, [28]), movie(2, [35, 18]), movie(3, [35]), movie(4, [99])];

  it("moves films that share your picked genres to the front", () => {
    const ranked = rankByTaste(pool, new Map([[35, 3], [18, 1]]), new Set(), fixedRandom(0.5));
    expect(ranked.map((m) => m.id)).toEqual([2, 3, 1, 4]);
  });

  it("drops films you have already picked", () => {
    const ranked = rankByTaste(pool, new Map([[35, 1]]), new Set([2, 3]));
    expect(ranked.map((m) => m.id)).not.toContain(2);
    expect(ranked.map((m) => m.id)).not.toContain(3);
  });

  it("keeps the order when there is no taste yet", () => {
    expect(rankByTaste(pool, new Map()).map((m) => m.id)).toEqual([1, 2, 3, 4]);
  });

  it("lets randomness beat a weak genre match", () => {
    let call = 0;
    // First film scores 0 on taste but gets max randomness; second gets a small match and no randomness.
    const random = () => (call++ === 0 ? 1 : 0);
    const ranked = rankByTaste([movie(1, [99]), movie(2, [35])], new Map([[35, 1], [18, 10]]), new Set(), random);
    expect(ranked[0].id).toBe(1);
  });
});

describe("uniqueMovies", () => {
  it("removes duplicates, keeping the first occurrence", () => {
    expect(uniqueMovies([movie(1, []), movie(2, []), movie(1, [])]).map((m) => m.id)).toEqual([1, 2]);
  });
});
