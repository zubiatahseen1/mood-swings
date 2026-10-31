# Mood Swings

[![CI](https://github.com/zubiatahseen1/mood-swings/actions/workflows/ci.yml/badge.svg)](https://github.com/zubiatahseen1/mood-swings/actions/workflows/ci.yml)

Most movie sites show you what's popular. I wanted one that helps you decide what to watch tonight, based on how you want to feel.

Pick a mood, and Mood Swings suggests 12 movies to match. Not feeling any of them? Hit reroll for 12 more. If you sign in, you can save films to a watchlist and tell the app what you actually ended up watching. After a few of those picks, that mood starts suggesting more films like the ones you chose.

## Where this started

The [first version](https://github.com/zubiatahseen1/mood-swings/tree/v1) was plain HTML, CSS and JavaScript, with no framework. It worked, but it had limits: my TMDB API key was visible to anyone who opened the browser's dev tools, there were no accounts, and nothing was tested.

So I rebuilt it. The idea is the same; almost everything underneath is new. The original code is still here under the `v1` tag if you'd like to compare.

## What I built it with

Next.js, React and TypeScript for the app itself, styled with Tailwind CSS and shadcn/ui. TanStack Query handles fetching and caching in the browser. Supabase (PostgreSQL) stores accounts, watchlists and picks. Forms and URLs are validated with Zod and React Hook Form. Tests are written with Vitest and Playwright, and GitHub Actions runs all of them on every push.

## Things I'm happy with

**The API key is private now.** The browser never talks to TMDB directly anymore. It asks my own server, which holds the key and caches the responses, so popular moods load quickly and I'm not calling TMDB over and over for the same list.

**Rerolls feel instant.** Instead of fetching 12 films at a time, the app grabs a bigger pool, shuffles it, and deals from that. It only goes back for more when the pool runs low. The mood, the runtime filter and how many times you've rerolled are all saved in the URL, so the back button works and you can send someone your exact results.

**Picks that learn, but not too much.** When you say you're watching something, I store its genres alongside the mood you came from. That mood's results then lean towards similar genres, but I kept a good amount of randomness in the mix so you don't end up with the same kind of film every time. Anything you've already picked gets left out.

**Your data is yours.** Every watchlist and pick row in the database is locked to its owner with Row Level Security. Even though the browser talks to the database directly, nobody can read or change someone else's list.

**Clear error messages.** If something goes wrong, the app tells you what happened: no connection, too many requests, a film that doesn't exist. Not just "something went wrong".

**Tested properly.** Unit tests cover the shuffling and ranking logic and the input validation. End-to-end tests click through the real app (choosing a mood, filtering, rerolling, searching, logging in) on desktop and on a phone-sized screen. They run against a fake version of TMDB, so the results are the same every time and no API key is needed.

## Running it yourself

You'll need Node 20.9 or newer, a free [TMDB API key](https://www.themoviedb.org/settings/api) and a free [Supabase](https://supabase.com) project.

```bash
npm install
cp .env.example .env.local   # add your keys here
npm run dev
```

Then open http://localhost:3000. Browsing movies works straight away; accounts need Supabase set up:

1. Create a project on Supabase.
2. In the **SQL Editor**, run the file in `supabase/migrations/`. It creates the tables and the security rules.
3. Copy the Project URL and publishable key from **Project Settings → API** into `.env.local`.
4. Under **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` as a redirect URL.

To run the tests: `npm test` for the unit tests, and `npm run test:e2e` for the end-to-end tests (run `npx playwright install chromium` once first).

## What I'd add next

A "surprise me across all moods" button, and letting you rate what you watched so the suggestions can learn from what you didn't enjoy too.

## Credits

Film data comes from [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
