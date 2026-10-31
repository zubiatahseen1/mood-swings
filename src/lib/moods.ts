/**
 * FRAMING: every mood is a WANT, not a STATE. The page asks what you want to
 * feel tonight, not how you feel right now. "Scared" returns horror because
 * someone who wants a fright picks it.
 *
 * TMDB separators: include uses | (OR), exclude uses , (exclude ANY).
 */
export const MOODS = {
  happy: {
    label: "Happy",
    caption: "Good vibes only",
    accent: "#F2B441",
    include: "35|16|12", // comedy, animation, adventure
    exclude: "27,10752,53", // horror, war, thriller
  },
  sad: {
    label: "Sad",
    caption: "Need a good cry",
    accent: "#5C8AD1",
    include: "18|10749", // drama, romance
    exclude: "35,28", // comedy, action
  },
  angry: {
    label: "Angry",
    caption: "Something with teeth",
    accent: "#E05A45",
    include: "28|80|10752", // action, crime, war
    exclude: "10751,10749", // family, romance
  },
  chill: {
    label: "Chill",
    caption: "Low stakes, warm blanket",
    accent: "#4FB09B",
    include: "10751|10402|99", // family, music, documentary
    exclude: "28,27,53,878", // action, horror, thriller, sci-fi
  },
  surprise: {
    label: "Surprise me",
    caption: "Anything but predictable",
    accent: "#9B7BD4",
    include: "9648|878|14", // mystery, sci-fi, fantasy
    exclude: "",
  },
  romantic: {
    label: "Romantic",
    caption: "Hopeless or otherwise",
    accent: "#E37098",
    include: "10749", // romance
    exclude: "27,80", // horror, crime
  },
  scared: {
    label: "Scared",
    caption: "Thrill seeking",
    accent: "#A3C93A",
    include: "27|53", // horror, thriller
    exclude: "10751,35", // family, comedy
  },
} as const;

export type MoodKey = keyof typeof MOODS;
export type Mood = (typeof MOODS)[MoodKey];

export const MOOD_KEYS = Object.keys(MOODS) as MoodKey[];

export function isMoodKey(value: unknown): value is MoodKey {
  return typeof value === "string" && value in MOODS;
}

/** Runtime bands: the one filter that earns its place. */
export const RUNTIMES = {
  any: { label: "Any length", params: {} },
  short: { label: "Under 90 min", params: { "with_runtime.lte": 89 } },
  medium: {
    label: "90–120 min",
    params: { "with_runtime.gte": 90, "with_runtime.lte": 120 },
  },
  long: { label: "Over 2 hours", params: { "with_runtime.gte": 121 } },
} as const satisfies Record<string, { label: string; params: Record<string, number> }>;

export type RuntimeKey = keyof typeof RUNTIMES;

export const RUNTIME_KEYS = Object.keys(RUNTIMES) as RuntimeKey[];

export function isRuntimeKey(value: unknown): value is RuntimeKey {
  return typeof value === "string" && value in RUNTIMES;
}

export const PAGE_SIZE = 12;
