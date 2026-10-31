/**
 * A tiny fake TMDB for end-to-end tests. The app's server calls this
 * instead of the real API (TMDB_BASE_URL), so tests are deterministic
 * and need no API key or network.
 *
 * Special cases:
 *   discover with genre 10751 (Chill) has only 1 page, to test "That is everything".
 *   movie id 999999 returns 404.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_TMDB_PORT ?? 4010);
const GENRES = [35, 16, 12, 18, 10749, 28, 80, 53];

const movie = (id) => ({
  id,
  title: `Test Movie ${id}`,
  overview: `Overview for test movie ${id}.`,
  release_date: `${1990 + (id % 30)}-06-01`,
  poster_path: `/poster-${id}.jpg`,
  backdrop_path: `/backdrop-${id}.jpg`,
  vote_average: 6 + (id % 30) / 10,
  genre_ids: [GENRES[id % GENRES.length], GENRES[(id + 3) % GENRES.length]],
});

const page = (n, total) => ({
  page: n,
  total_pages: total,
  total_results: total * 20,
  results: n > total ? [] : Array.from({ length: 20 }, (_, i) => movie(n * 100 + i)),
});

const details = (id) => ({
  ...movie(id),
  runtime: 128,
  tagline: "A tagline for testing.",
  genres: [
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
  ],
  credits: {
    cast: [
      { id: 1, name: "Ada Actor", character: "Lead", profile_path: "/ada.jpg" },
      { id: 2, name: "Bo Bit", character: "Friend", profile_path: "/bo.jpg" },
    ],
    crew: [
      { id: 9, name: "Dee Director", job: "Director" },
      { id: 9, name: "Dee Director", job: "Screenplay" },
    ],
  },
  videos: { results: [{ key: "abc123", site: "YouTube", type: "Trailer", official: true }] },
});

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const send = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  const n = Number(url.searchParams.get("page") ?? 1);

  if (url.pathname === "/health") return send(200, { ok: true });
  if (url.pathname === "/3/discover/movie") {
    const total = (url.searchParams.get("with_genres") ?? "").includes("10751") ? 1 : 9;
    return send(200, page(n, total));
  }
  if (url.pathname === "/3/search/movie") return send(200, page(n, 2));
  const match = url.pathname.match(/^\/3\/movie\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    return id === 999999 ? send(404, { status_message: "Not found" }) : send(200, details(id));
  }
  send(404, { status_message: "Unknown endpoint" });
}).listen(PORT, () => console.log(`Mock TMDB on http://localhost:${PORT}`));
