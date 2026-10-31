"use client";

import { useMoodAccent } from "@/hooks/use-mood-accent";

/** Renders nothing; tints the whole page in a mood's colour while mounted. */
export function MoodAccent({ color }: { color: string }) {
  useMoodAccent(color);
  return null;
}
