import Image from "next/image";
import Link from "next/link";
import { MOOD_KEYS, MOODS } from "@/lib/moods";

/** Fully static: prerendered at build time and served instantly. */
export default function HomePage() {
  return (
    <>
      <section className="max-w-2xl pb-10">
        <h1 className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
          What are you <em className="text-mood not-italic">in the mood</em> for?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Not what is trending. Not what an algorithm thinks you watched last. Tell us what you want
          to feel tonight and we will find something that fits.
        </p>
      </section>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="mood-list">
        {MOOD_KEYS.map((key, index) => {
          const mood = MOODS[key];
          return (
            <li key={key}>
              <Link
                href={`/mood/${key}`}
                className="group block overflow-hidden rounded-xl border bg-card transition-[border-color,transform] duration-200 outline-none hover:-translate-y-0.5 hover:border-[var(--hue)] focus-visible:border-[var(--hue)] focus-visible:ring-[3px] focus-visible:ring-[var(--hue)]/40"
                style={{ "--hue": mood.accent } as React.CSSProperties}
              >
                <span className="relative block aspect-square overflow-hidden">
                  <Image
                    src={`/moods/${key}.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    priority={index < 4}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="block p-4">
                  <span className="block font-display text-lg font-semibold">{mood.label}</span>
                  <span className="block text-sm text-muted-foreground">{mood.caption}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
