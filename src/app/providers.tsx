"use client";

import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { userQueryKey } from "@/hooks/use-user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  const make = () =>
    new QueryClient({
      defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 60_000 } },
    });
  // Keep server renders isolated and reuse one client in the browser.
  if (typeof window === "undefined") return make();
  browserQueryClient ??= make();
  return browserQueryClient;
}

/** Keeps the cached user in sync with Supabase (login, logout, token refresh). */
function AuthListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data } = getSupabaseBrowserClient().auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(userQueryKey, session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <AuthListener />
      {children}
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  );
}
