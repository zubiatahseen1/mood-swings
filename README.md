# Mood Swings

**Films for how you feel right now.**

Most film sites answer "what is popular?" This one answers "what should I watch
tonight?" — a different question, and the only one the interface is built around.
Pick a mood, optionally say how much evening you have left, and get twelve films.
Don't like them? Deal twelve more.

Built with vanilla JavaScript, ES modules, and the TMDB API. No framework.

---

## Running it

```bash
git clone <repo-url>
cd mood_swings
# add your TMDB key to js/config.js
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

A TMDB API key is free from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
ES modules require a server — opening `index.html` from the filesystem will fail
CORS. Any static server works.

---

## Decisions worth explaining

**The mood grid is the whole home page.** An earlier version led with a search
box and a trending carousel, with moods third. That buried the one thing the site
does differently behind two things every film site already has. Trending was cut
entirely; search moved to the nav as a utility.

**Moods are wants, not states.** The page asks what you want to feel tonight,
not how you feel right now. Those are different questions and an earlier version
mixed them — the headline asked one, the subhead asked the other. Under "how you
feel", "Scared → horror" is nonsense; under "what you want" it is obviously
right, and so is "Sad → need a good cry". Committing to want also killed the
weakest entry: boredom is a state with no matching desire, so "Bored" became
"Surprise me", which is what it always meant.

**The home page ships zero JavaScript.** Every mood is an `<a href="results.html?mood=happy">`
and search is a plain `<form method="get">`. Both produce the right URL natively,
which means the page is keyboard-navigable, works before scripts parse, and each
mood is shareable. A click handler would have made all three worse.

**All state lives in the URL.** `results.html?mood=happy&runtime=short`,
`details.html?id=550`. The original build passed state through `localStorage`,
which broke the back button, made results unshareable, and corrupted itself
across two open tabs. Query params fixed all of it and removed code.

**Recommendations are sampled, not sorted.** Filtering by genre and sorting by
popularity returns the same twenty films every time — that's a filter wearing a
recommendation costume. Instead the app pools several pages of candidates,
shuffles once, and deals twelve at a time. Rerolling serves from the pool rather
than refetching, so the button responds instantly and only hits the network when
the pool runs low.

**Exclusions matter as much as inclusions.** "Angry" asks TMDB for action, crime
and war — and explicitly excludes family and romance. Without the exclusions a
lighthearted comedy scores well on popularity and breaks the promise the mood made.

**Every remote value reaches the DOM through `textContent`.** TMDB is
community-edited, so its data is untrusted input. `js/render.js` builds nodes
with `createElement` and never interpolates into `innerHTML`. Verified with a
hostile-payload test: an `<img onerror>` in a film title renders as literal text.

**Each mood owns an accent colour** which propagates to the results page —
headings, chips, focus rings, rating badges. The colour encodes app state rather
than decorating it, so the site visibly takes on the mood you chose.

---

## Structure

```
index.html          mood grid — no JS
results.html        pooled results, runtime filter, reroll
details.html        cast, crew, synopsis, trailer

js/config.js        API config + mood and runtime definitions
js/api.js           single fetch wrapper; typed ApiError
js/movie.js         Movie model — TMDB's shape stops here
js/render.js        DOM builders, skeletons, error/empty states
js/results.js       pooling, shuffling, URL state
js/details.js       detail page
```

`config.js` is the only file that knows a mood's genres *and* its colour, so
adding a mood is one object plus one list item.

---

## Handling the API key

A browser-only app cannot hide a key — anything shipped to the client is readable
in DevTools. This build treats the key as public (TMDB read keys are rate-limited
and revocable) and keeps it out of the repo via `.gitignore`.

For a deployment where that isn't acceptable, put a function in front of it:

```js
// netlify/functions/tmdb.js
export async function handler(event) {
  const url = new URL('https://api.themoviedb.org/3' + event.queryStringParameters.path);
  url.searchParams.set('api_key', process.env.TMDB_KEY); // server-side only
  const res = await fetch(url);
  return { statusCode: res.status, body: await res.text() };
}
```

Then point `BASE_URL` at `/.netlify/functions/tmdb` and the key never leaves the server.

---

## Accessibility

- Skip links on every page
- All interactive elements are real `<a>` or `<button>` — the app is fully
  operable by keyboard, including mood selection
- Visible focus rings, tinted to the active mood
- Results grid is an `aria-live` region with `aria-busy` managed across load,
  success, and failure
- Decorative mood art carries empty `alt`; posters carry the film title
- `prefers-reduced-motion` disables all transitions and the skeleton shimmer

## Performance

- Mood artwork: 47.7&nbsp;MB of 2048px PNGs → 266&nbsp;KB of 640px WebP
- Explicit `width`/`height` on every image to reserve space and avoid layout shift
- `fetchpriority="high"` on the first mood tile, `loading="lazy"` below the fold
- Skeleton cards hold the grid's shape while results load
- `preconnect` to the TMDB image CDN
- No framework, no jQuery, no build step

---

## Known limits

- TMDB's search endpoint has no runtime parameter, so the runtime filter is
  hidden in search mode rather than shown and silently ignored.
- The candidate pool is capped at 20 pages per mood. Past that, the app says so
  rather than looping.
- Moods map to fixed genre sets. Learning from what a user actually picks would
  be the natural next version — and would need a backend.

---

Film data from [TMDB](https://www.themoviedb.org/). This product uses the TMDB
API but is not endorsed or certified by TMDB.

Built by Zubia Tahseen.
