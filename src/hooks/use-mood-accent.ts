"use client";

import { useEffect } from "react";

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
