"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Movie } from "@/lib/types";
import { useUser } from "./use-user";

export function useWatchlist() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

/** Adds or removes a film, then refetches so every screen agrees. */
export function useToggleWatchlist() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: watchlist = [] } = useWatchlist();

  const mutation = useMutation({
    mutationFn: async (movie: Movie) => {
      if (!user) throw new Error("Log in to save films.");
      const supabase = getSupabaseBrowserClient();
      const existing = watchlist.find((item) => item.tmdb_id === movie.id);

      if (existing) {
        const { error } = await supabase.from("watchlist").delete().eq("id", existing.id);
        if (error) throw error;
        return { added: false, title: movie.title };
      }

      const { error } = await supabase.from("watchlist").insert({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.posterPath,
        release_year: movie.year,
        vote_average: movie.rating ? Number(movie.rating) : null,
      });
      if (error) throw error;
      return { added: true, title: movie.title };
    },
    onSuccess: ({ added, title }) =>
      toast.success(added ? `Saved “${title}” to your watchlist` : `Removed “${title}”`),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] }),
  });

  const isSaved = (id: number) => watchlist.some((item) => item.tmdb_id === id);
  return { toggle: mutation.mutate, isPending: mutation.isPending, isSaved };
}
