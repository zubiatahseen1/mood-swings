import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MovieGridSkeleton } from "@/components/movie-grid";
import { WatchlistView } from "@/components/watchlist-view";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your watchlist" };

export default function WatchlistPage() {
  return (
    <>
      <header className="border-b pb-6">
        <h1 className="text-4xl font-bold">Your watchlist</h1>
        <p className="mt-1 text-muted-foreground">Films you saved for later.</p>
      </header>
      {/* The session is checked on the server, per request, behind a boundary. */}
      <Suspense fallback={<MovieGridSkeleton count={6} />}>
        <RequireUser />
      </Suspense>
    </>
  );
}

async function RequireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/watchlist");
  return <WatchlistView />;
}
