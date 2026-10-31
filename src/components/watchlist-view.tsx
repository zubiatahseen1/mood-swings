"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { StateMessage } from "@/components/state-message";
import { usePicks } from "@/hooks/use-picks";
import { useWatchlist } from "@/hooks/use-watchlist";
import { isMoodKey, MOODS } from "@/lib/moods";
import type { Movie } from "@/lib/types";

export function WatchlistView() {
  const { data: watchlist, isPending } = useWatchlist();
  const { data: picks = [] } = usePicks();

  const movies: Movie[] = (watchlist ?? []).map((item) => ({
    id: item.tmdb_id,
    title: item.title,
    overview: "",
    year: item.release_year,
    posterPath: item.poster_path,
    backdropPath: null,
    rating: item.vote_average ? Number(item.vote_average).toFixed(1) : null,
    genreIds: [],
  }));

  return (
    <>
      <section className="pt-8">
        {isPending ? (
          <MovieGridSkeleton count={6} />
        ) : movies.length === 0 ? (
          <StateMessage
            title="Nothing saved yet"
            action={
              <Button asChild>
                <Link href="/">Pick a mood</Link>
              </Button>
            }
          >
            Hover a poster and tap the bookmark to save it here.
          </StateMessage>
        ) : (
          <MovieGrid movies={movies} />
        )}
      </section>

      {picks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">What you&apos;ve picked</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            After three picks in a mood, its suggestions lean towards films like these.
          </p>
          <ul className="mt-4 divide-y rounded-xl border" data-testid="pick-history">
            {picks.slice(0, 20).map((pick) => {
              const mood = isMoodKey(pick.mood) ? MOODS[pick.mood] : null;
              return (
                <li key={pick.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <Link href={`/movie/${pick.tmdb_id}?mood=${pick.mood}`} className="font-medium hover:underline">
                    {pick.title}
                  </Link>
                  <span className="flex items-center gap-3">
                    {mood && (
                      <Badge variant="outline" style={{ color: mood.accent, borderColor: mood.accent }}>
                        {mood.label}
                      </Badge>
                    )}
                    <time className="text-xs text-muted-foreground" dateTime={pick.created_at}>
                      {new Date(pick.created_at).toLocaleDateString()}
                    </time>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
