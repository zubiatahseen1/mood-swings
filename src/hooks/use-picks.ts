"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MoodKey } from "@/lib/moods";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "./use-user";

/** Every film you said you are watching. Used to tune future suggestions. */
export function usePicks() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["picks", user?.id],
    queryFn: async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from("picks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

interface NewPick {
  tmdbId: number;
  title: string;
  mood: MoodKey;
  genreIds: number[];
}

export function useAddPick() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pick: NewPick) => {
      if (!user) throw new Error("Log in so we can learn what you like.");
      const { error } = await getSupabaseBrowserClient().from("picks").insert({
        tmdb_id: pick.tmdbId,
        title: pick.title,
        mood: pick.mood,
        genre_ids: pick.genreIds,
      });
      if (error) throw error;
    },
    onSuccess: (_data, pick) =>
      toast.success(`Enjoy “${pick.title}”. Your ${pick.mood} picks just got smarter.`),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["picks", user?.id] }),
  });
}
