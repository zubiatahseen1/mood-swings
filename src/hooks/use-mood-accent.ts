"use client";

import { useEffect } from "react";

/**
 * Sets the page's accent colour. Buttons, focus rings, the logo and ratings
 * all read --accent-mood, so the whole page visibly takes on the mood.
 */
export function useMoodAccent(color: string | undefined) {
  useEffect(() => {
    if (!color) return;
    const root = document.documentElement;
    root.style.setProperty("--accent-mood", color);
    return () => {
      root.style.removeProperty("--accent-mood");
    };
  }, [color]);
}
