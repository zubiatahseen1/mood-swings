"use client";

import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { ErrorMessage, StateMessage } from "@/components/state-message";
import { fetchSearchPage } from "@/lib/api-client";
import { uniqueMovies } from "@/lib/pool";

export function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim();

  const { data, error, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["search", q],
      queryFn: ({ pageParam }) => fetchSearchPage(q, pageParam),
      initialPageParam: 1,
      getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
      enabled: q.length > 0,
    });

  if (!q) {
    return <StateMessage title="Search for a film">Type a title in the search box above.</StateMessage>;
  }

  const movies = uniqueMovies(data?.pages.flatMap((page) => page.movies) ?? []);

  return (
    <>
      <header className="border-b pb-6">
        <p className="text-sm text-muted-foreground">Search results for</p>
        <h1 className="text-4xl font-bold">“{q}”</h1>
      </header>

      <section className="pt-8">
        {isPending ? (
          <MovieGridSkeleton />
        ) : isError ? (
          <ErrorMessage error={error} onRetry={() => refetch()} />
        ) : movies.length === 0 ? (
          <StateMessage title="Nothing matched">No films came back for “{q}”. Try a different spelling.</StateMessage>
        ) : (
          <>
            <MovieGrid movies={movies} />
            {hasNextPage && (
              <div className="mt-10 text-center">
                <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
