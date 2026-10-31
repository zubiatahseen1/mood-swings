"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Check, Clapperboard, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddPick, usePicks } from "@/hooks/use-picks";
import { useMoodAccent } from "@/hooks/use-mood-accent";
import { useUser } from "@/hooks/use-user";
import { useToggleWatchlist } from "@/hooks/use-watchlist";
import { isMoodKey, MOODS } from "@/lib/moods";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Reads ?mood= so the page keeps the colour and link of the mood you came from. */
function useFromMood() {
  const mood = useSearchParams().get("mood");
  return isMoodKey(mood) ? mood : undefined;
}

export function MoodBackLink() {
  const mood = useFromMood();
  useMoodAccent(mood ? MOODS[mood].accent : undefined);
  if (!mood) return null;
  return (
    <Link href={`/mood/${mood}`} className="text-sm font-semibold text-mood hover:underline">
      ← {MOODS[mood].label}
    </Link>
  );
}

export function MovieActions({ movie, trailerKey }: { movie: Movie; trailerKey?: string }) {
  const mood = useFromMood();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoggedIn, isPending: userPending } = useUser();
  const { toggle, isSaved, isPending } = useToggleWatchlist();
  const { data: picks = [] } = usePicks();
  const addPick = useAddPick();

  const saved = isSaved(movie.id);
  const alreadyPicked = picks.some((pick) => pick.tmdb_id === movie.id && pick.mood === mood);
  const here = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {trailerKey && (
        <Button asChild variant="secondary">
          <a href={`https://www.youtube.com/watch?v=${trailerKey}`} target="_blank" rel="noreferrer">
            <Play /> Watch trailer
          </a>
        </Button>
      )}

      {userPending ? null : isLoggedIn ? (
        <>
          <Button variant="outline" onClick={() => toggle(movie)} disabled={isPending} aria-pressed={saved}>
            <Bookmark className={cn(saved && "fill-current text-mood")} />
            {saved ? "Saved" : "Save to watchlist"}
          </Button>

          {mood && (
            <Button
              onClick={() =>
                addPick.mutate({ tmdbId: movie.id, title: movie.title, mood, genreIds: movie.genreIds })
              }
              disabled={alreadyPicked || addPick.isPending}
            >
              {alreadyPicked ? <Check /> : <Clapperboard />}
              {alreadyPicked ? "Picked" : "I'm watching this"}
            </Button>
          )}
        </>
      ) : (
        <Button asChild variant="outline">
          <Link href={`/login?next=${encodeURIComponent(here)}`}>
            <Bookmark /> Log in to save films
          </Link>
        </Button>
      )}
    </div>
  );
}
