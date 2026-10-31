import type { MoodKey } from "@/lib/moods";
import type { Movie } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieCard } from "./movie-card";

const gridClass = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

export function MovieGrid({ movies, mood }: { movies: Movie[]; mood?: MoodKey }) {
  return (
    <div className={gridClass} data-testid="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} mood={mood} />
      ))}
    </div>
  );
}

/** Placeholder cards, so the layout doesn't jump while loading. */
export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={gridClass} aria-busy="true" aria-label="Loading films">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
