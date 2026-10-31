# Mood Swings

[![CI](https://github.com/zubiatahseen1/mood-swings/actions/workflows/ci.yml/badge.svg)](https://github.com/zubiatahseen1/mood-swings/actions/workflows/ci.yml)

Most movie sites show you what's popular. Mood Swings helps you decide what to watch tonight, based on how you want to feel.

Pick a mood and get 12 films that match. Not feeling any of them? Reroll for 12 more. Sign in to keep a watchlist, and tell it what you actually watched: after three picks in a mood, that mood's suggestions start leaning towards films like the ones you chose.

## Version history

- **v2 (current):** rebuilt in Next.js, React and TypeScript, with accounts, a watchlist, picks that learn, server-side caching, and automated tests.
- **[v1](https://github.com/zubiatahseen1/mood-swings/tree/v1):** the original, written in plain HTML, CSS and JavaScript with no framework. Its code is kept under the `v1` tag.

## Tech stack

| | |
|---|---|
| **Next.js 16 (App Router)** | Server Components, Route Handlers, Cache Components (`"use cache"`), Proxy |
| **React 19 + TypeScript** | Strict typing end to end |
| **Tailwind CSS v4 + shadcn/ui** | Styling and accessible components (Button, Card, Tabs, Dropdown, Badge, Skeleton, toasts) |
| **TanStack Query** | Client-side fetching, caching and paging (`useInfiniteQuery`) for rerolls and search |
| **Supabase (PostgreSQL)** | Auth plus `watchlist` and `picks` tables, secured with Row Level Security |
| **Zod + React Hook Form** | Validation for forms, URL params and API input |
| **Vitest + Testing Library** | Unit and component tests |
| **Playwright** | End-to-end tests against a mock TMDB, on desktop and mobile |
| **GitHub Actions** | Lint, type check, unit tests and end-to-end tests on every push |
| **Vercel** | Hosting |

## What changed from v1

- **The TMDB key stays secret.** In version 1 the key shipped to the browser. Now TMDB is only called from the server (`src/lib/tmdb.ts`), and the browser talks to this app's own `/api` routes.
- **Accounts, a watchlist and picks that learn.** Tap "I'm watching this" on a film. Its genres are stored with the mood you came from, and that mood's results are re-ranked towards your taste: 60% genre match and 40% random, so results don't collapse into one genre. Films you've already picked are left out.
- **Fast pages.** The home page and the seven mood pages are prerendered at build time. TMDB responses are cached on the server (an hour for lists, a day for films), and rerolls are cached in the browser.

## How it works

- **The mood pool** (`src/components/mood-results.tsx`, `src/app/api/discover/route.ts`). Each batch pulls 3 TMDB pages on the server, and the browser shuffles them. Rerolling deals the next 12 and only fetches when the pool runs low. Mood, runtime and reroll round all live in the URL, so the back button works and results are shareable.
- **Taste ranking** (`src/lib/pool.ts`). `genreWeights` counts the genres in your picks for a mood. `rankByTaste` scores each film on genre overlap plus randomness.
- **Security** (`supabase/migrations/`). Row Level Security policies mean each user can only read, add or delete their own rows, even though the browser talks to the database directly.
- **Validation** (`src/lib/schemas.ts`). URL params, API queries and forms are all checked with Zod. A hand-edited URL falls back to sensible defaults instead of breaking the page.
- **Errors** (`src/lib/errors.ts`). Every failure has a kind (`network`, `ratelimit`, `notfound`, and so on), so the UI can say what actually happened.

## Run it locally

You need Node 20.9+, a free [TMDB API key](https://www.themoviedb.org/settings/api) and a free [Supabase](https://supabase.com) project.

```bash
npm install
cp .env.example .env.local   # then fill in the three values
npm run dev
```

Then open http://localhost:3000. The movie pages work without Supabase; accounts need the next step.

### Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `supabase/migrations/20261031000000_watchlist_and_picks.sql`, and run it.
3. In **Project Settings → API**, copy the Project URL and the publishable (or anon) key into `.env.local`.
4. In **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the redirect URLs.
5. Optional, for a quicker demo: in **Authentication → Providers → Email**, turn off "Confirm email" so sign-ups log in immediately.

## Scripts

| | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then run TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright). Run `npx playwright install chromium` once first. |

The end-to-end tests start a mock TMDB server (`e2e/mock-tmdb.mjs`), so they need no API key and always return the same results.


## Credits

Film data from [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
