"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToggleWatchlist } from "@/hooks/use-watchlist";
import type { MoodKey } from "@/lib/moods";
import { imageUrl, type Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  /** Passed along so the details page knows which mood you came from. */
  mood?: MoodKey;
}

export function MovieCard({ movie, mood }: MovieCardProps) {
  const { isLoggedIn } = useUser();
  const { toggle, isSaved, isPending } = useToggleWatchlist();
  const saved = isSaved(movie.id);
  const poster = imageUrl(movie.posterPath, "w342");
  const href = mood ? `/movie/${movie.id}?mood=${mood}` : `/movie/${movie.id}`;

  return (
    <article className="group relative" data-testid="movie-card">
      <Link
        href={href}
        className="block rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
          {poster ? (
            // TMDB already serves pre-sized images, so Next's optimiser is skipped.
            <Image
              src={poster}
              alt={`Poster for ${movie.title}`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid size-full place-items-center text-sm text-muted-foreground">
              No poster
            </div>
          )}
          {movie.rating && (
            <span className="absolute top-2 right-2 rounded-md bg-background/85 px-1.5 py-0.5 text-xs font-semibold text-mood">
              {movie.rating}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 font-sans text-sm leading-snug font-semibold">{movie.title}</h3>
        {movie.year && <p className="text-xs text-muted-foreground">{movie.year}</p>}
      </Link>

      {isLoggedIn && (
        <button
          type="button"
          onClick={() => toggle(movie)}
          disabled={isPending}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
          className={cn(
            "absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-background/85 transition-opacity",
            saved ? "text-mood opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
        </button>
      )}
    </article>
  );
}
