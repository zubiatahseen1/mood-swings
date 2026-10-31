import { describe, expect, it } from "vitest";
import { imageUrl, runtimeLabel, toMovie } from "./types";

describe("toMovie", () => {
  it("maps TMDB's shape to the app's own", () => {
    const movie = toMovie({
      id: 550,
      title: "Fight Club",
      overview: "…",
      release_date: "1999-10-15",
      poster_path: "/p.jpg",
      vote_average: 8.433,
      genre_ids: [18],
    });
    expect(movie).toMatchObject({ id: 550, year: "1999", rating: "8.4", posterPath: "/p.jpg", genreIds: [18] });
  });

  it("handles missing optional fields", () => {
    const movie = toMovie({ id: 1, title: "x", overview: "", poster_path: null });
    expect(movie).toMatchObject({ year: null, rating: null, backdropPath: null, genreIds: [] });
  });
});

describe("helpers", () => {
  it("formats runtimes", () => {
    expect(runtimeLabel(128)).toBe("2h 8m");
    expect(runtimeLabel(45)).toBe("45m");
    expect(runtimeLabel(null)).toBeNull();
  });

  it("builds TMDB image URLs", () => {
    expect(imageUrl("/a.jpg", "w185")).toBe("https://image.tmdb.org/t/p/w185/a.jpg");
    expect(imageUrl(null)).toBeNull();
  });
});
