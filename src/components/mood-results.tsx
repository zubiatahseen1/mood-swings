"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { ErrorMessage, StateMessage } from "@/components/state-message";
import { usePicks } from "@/hooks/use-picks";
import { useUser } from "@/hooks/use-user";
import { fetchMoodBatch } from "@/lib/api-client";
import { PAGE_SIZE, RUNTIME_KEYS, RUNTIMES, type MoodKey, type RuntimeKey } from "@/lib/moods";
import { genreWeights, MIN_PICKS_TO_TUNE, rankByTaste, uniqueMovies } from "@/lib/pool";
import { moodSearchSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function moodHref(mood: MoodKey, runtime: RuntimeKey, round = 0) {
  const params = new URLSearchParams();
  if (runtime !== "any") params.set("runtime", runtime);
  if (round > 0) params.set("round", String(round));
  const query = params.toString();
  return `/mood/${mood}${query ? `?${query}` : ""}`;
}

/**
 * The mood pool. Each batch is 3 TMDB pages, shuffled, cached by TanStack
 * Query per mood + runtime. Rerolling deals the next 12 from the pool and
 * only fetches when it runs low. The round lives in the URL, so the back
 * button and shared links both work.
 */
export function MoodResults({ mood }: { mood: MoodKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { runtime, round } = moodSearchSchema.parse(Object.fromEntries(searchParams)) as {
    runtime: RuntimeKey;
    round: number;
  };

  const { isLoggedIn } = useUser();
  const { data: picks = [] } = usePicks();
  const moodPicks = useMemo(() => picks.filter((pick) => pick.mood === mood), [picks, mood]);
  const tuned = isLoggedIn && moodPicks.length >= MIN_PICKS_TO_TUNE;

  const { data, error, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["mood-pool", mood, runtime],
      queryFn: ({ pageParam }) => fetchMoodBatch(mood, runtime, pageParam),
      initialPageParam: 0,
      getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
      staleTime: 30 * 60_000,
    });

  // Each batch is ranked on its own, so earlier rounds keep their films when more load.
  const pool = useMemo(() => {
    if (!data) return [];
    const weights = tuned ? genreWeights(moodPicks) : new Map<number, number>();
    const pickedIds = new Set(moodPicks.map((pick) => pick.tmdb_id));
    return uniqueMovies(
      data.pages.flatMap((page) => (tuned ? rankByTaste(page.movies, weights, pickedIds) : page.movies)),
    );
  }, [data, tuned, moodPicks]);

  const needed = (round + 1) * PAGE_SIZE;
  const batch = pool.slice(round * PAGE_SIZE, needed);
  const canDealMore = pool.length > needed || hasNextPage;

  // Rerolling past the end of the pool quietly fetches the next batch.
  useEffect(() => {
    if (pool.length < needed && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [pool.length, needed, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <nav aria-label="Runtime" className="flex flex-wrap gap-2" data-testid="runtime-filters">
          {RUNTIME_KEYS.map((key) => (
            <Link
              key={key}
              href={moodHref(mood, key)}
              scroll={false}
              aria-current={key === runtime ? "true" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                key === runtime
                  ? "border-mood bg-mood text-primary-foreground"
                  : "text-muted-foreground hover:border-mood/60 hover:text-foreground",
              )}
            >
              {RUNTIMES[key].label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {tuned && (
            <Badge variant="outline" className="gap-1.5 border-mood/40 text-mood" data-testid="tuned-badge">
              <Sparkles /> Tuned to your taste
            </Badge>
          )}
          {canDealMore && !isError && (
            <Button
              onClick={() => router.push(moodHref(mood, runtime, round + 1), { scroll: false })}
              disabled={isPending || isFetchingNextPage}
            >
              <RefreshCw className={cn(isFetchingNextPage && "animate-spin")} />
              Show me {PAGE_SIZE} more
            </Button>
          )}
        </div>
      </div>

      <section className="pt-8" aria-live="polite">
        {isPending ? (
          <MovieGridSkeleton />
        ) : isError ? (
          <ErrorMessage error={error} onRetry={() => refetch()} />
        ) : batch.length > 0 ? (
          <MovieGrid movies={batch} mood={mood} />
        ) : isFetchingNextPage || hasNextPage ? (
          <MovieGridSkeleton />
        ) : (
          <StateMessage
            title="That is everything"
            action={
              <Button asChild variant="secondary">
                <Link href={moodHref(mood, runtime)}>Start over</Link>
              </Button>
            }
          >
            You have seen every film we have for this mood and length. Try another runtime.
          </StateMessage>
        )}
      </section>
    </>
  );
}
