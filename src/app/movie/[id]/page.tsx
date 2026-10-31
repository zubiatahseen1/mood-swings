import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoodBackLink, MovieActions } from "@/components/movie-actions";
import { ErrorMessage } from "@/components/state-message";
import { kindOf } from "@/lib/errors";
import { getMovie } from "@/lib/tmdb";
import { imageUrl, runtimeLabel, toMovie } from "@/lib/types";

async function loadMovie(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  try {
    return { details: await getMovie(id) };
  } catch (error) {
    if (kindOf(error) === "notfound") notFound();
    return { error };
  }
}

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const { details } = await loadMovie((await params).id);
  return details ? { title: details.title, description: details.overview } : {};
}

export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  // The film is fetched per request (and cached for a day), so it streams in.
  return (
    <Suspense fallback={<MovieSkeleton />}>
      <MovieDetails params={params} />
    </Suspense>
  );
}

async function MovieDetails({ params }: { params: PageProps<"/movie/[id]">["params"] }) {
  const { details, error } = await loadMovie((await params).id);
  if (!details) return <ErrorMessage error={error} />;

  const movie = toMovie({ ...details, genre_ids: details.genres.map((g) => g.id) });
  const backdrop = imageUrl(movie.backdropPath, "w1280");
  const poster = imageUrl(movie.posterPath, "w500");
  const meta = [movie.year, runtimeLabel(details.runtime), movie.rating && `★ ${movie.rating}`].filter(Boolean);

  const videos = details.videos?.results ?? [];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser");

  const cast = (details.credits?.cast ?? []).filter((p) => p.profile_path).slice(0, 12);

  // One person can hold several key jobs: merge rather than list them twice.
  const crew = new Map<number, { name: string; jobs: string[] }>();
  for (const person of details.credits?.crew ?? []) {
    if (!["Director", "Screenplay", "Writer"].includes(person.job)) continue;
    const entry = crew.get(person.id) ?? { name: person.name, jobs: [] };
    if (!entry.jobs.includes(person.job)) entry.jobs.push(person.job);
    crew.set(person.id, entry);
  }

  return (
    <article>
      <div className="relative -mx-5 -mt-10 mb-8 overflow-hidden">
        {backdrop && (
          <Image src={backdrop} alt="" fill unoptimized priority className="object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

        <div className="relative flex flex-col gap-8 px-5 pt-16 pb-8 sm:flex-row sm:items-end">
          {poster && (
            <Image
              src={poster}
              alt={`Poster for ${movie.title}`}
              width={500}
              height={750}
              unoptimized
              priority
              className="w-40 shrink-0 rounded-lg shadow-2xl sm:w-56"
            />
          )}
          <div className="max-w-2xl">
            <Suspense>
              <MoodBackLink />
            </Suspense>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{movie.title}</h1>
            <p className="mt-2 flex flex-wrap gap-2 text-muted-foreground">
              {meta.map((bit, i) => (
                <span key={i}>
                  {i > 0 && (
                    <span aria-hidden="true" className="mr-2">
                      ·
                    </span>
                  )}
                  {bit}
                </span>
              ))}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {details.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          {details.tagline && <p className="font-display text-xl text-mood italic">{details.tagline}</p>}
          <p className="mt-3 max-w-prose leading-relaxed">
            {movie.overview || "No synopsis available for this title."}
          </p>

          <Suspense>
            <MovieActions movie={movie} trailerKey={trailer?.key} />
          </Suspense>

          {cast.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold">Cast</h2>
              <ul className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6" data-testid="cast">
                {cast.map((person) => (
                  <li key={person.id}>
                    <Image
                      src={imageUrl(person.profile_path, "w185")!}
                      alt={person.name}
                      width={185}
                      height={278}
                      unoptimized
                      className="aspect-[2/3] w-full rounded-md bg-secondary object-cover"
                    />
                    <p className="mt-1.5 text-sm leading-tight font-semibold">{person.name}</p>
                    {person.character && <p className="text-xs text-muted-foreground">{person.character}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {crew.size > 0 && (
          <aside>
            <h2 className="text-lg font-bold">Made by</h2>
            <ul className="mt-3 space-y-3">
              {[...crew.values()].map(({ name, jobs }) => (
                <li key={name}>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">{jobs.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}

function MovieSkeleton() {
  return (
    <div className="flex flex-col gap-8 pt-6 sm:flex-row sm:items-end" aria-busy="true" aria-label="Loading film">
      <Skeleton className="aspect-[2/3] w-40 rounded-lg sm:w-56" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
