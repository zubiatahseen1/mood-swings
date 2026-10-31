import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MoodAccent } from "@/components/mood-accent";
import { MoodResults } from "@/components/mood-results";
import { MovieGridSkeleton } from "@/components/movie-grid";
import { isMoodKey, MOOD_KEYS, MOODS } from "@/lib/moods";

/** The seven mood pages are prerendered at build time; any other mood is a 404. */
export function generateStaticParams() {
  return MOOD_KEYS.map((mood) => ({ mood }));
}

export async function generateMetadata({ params }: PageProps<"/mood/[mood]">): Promise<Metadata> {
  const { mood } = await params;
  return isMoodKey(mood) ? { title: MOODS[mood].label, description: MOODS[mood].caption } : {};
}

export default async function MoodPage({ params }: PageProps<"/mood/[mood]">) {
  const { mood } = await params;
  if (!isMoodKey(mood)) notFound();
  const details = MOODS[mood];

  return (
    <>
      <MoodAccent color={details.accent} />
      <header className="pb-6">
        <h1 className="text-4xl font-bold sm:text-5xl" style={{ color: details.accent }}>
          {details.label}
        </h1>
        <p className="mt-1 text-muted-foreground">{details.caption}</p>
      </header>

      {/* Filters and results read the URL's ?runtime and ?round, so they stream in. */}
      <Suspense fallback={<MovieGridSkeleton />}>
        <MoodResults mood={mood} />
      </Suspense>
    </>
  );
}
