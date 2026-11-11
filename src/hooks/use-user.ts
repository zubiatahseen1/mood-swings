"use client";

import { useQuery } from "@tanstack/react-query";
import { useHydrated } from "./use-hydrated";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const userQueryKey = ["user"] as const;

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
