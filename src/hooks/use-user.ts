"use client";

import { useQuery } from "@tanstack/react-query";
import { useHydrated } from "./use-hydrated";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const userQueryKey = ["user"] as const;

/**
 * The signed-in user (or null). Providers keeps this up to date by
 * listening to Supabase auth events, so login and logout update every screen.
 *
 * The session lives in the browser, so until hydration finishes this reports
 * "pending" everywhere, matching what the server rendered.
 */
export function useUser() {
  const hydrated = useHydrated();
  const { data, isPending } = useQuery({
    queryKey: userQueryKey,
    queryFn: async () => {
      if (!isSupabaseConfigured) return null;
      const { data } = await getSupabaseBrowserClient().auth.getUser();
      return data.user;
    },
    staleTime: Infinity,
  });
  const user = hydrated ? (data ?? null) : null;
  return { user, isLoggedIn: user !== null, isPending: !hydrated || isPending };
}
