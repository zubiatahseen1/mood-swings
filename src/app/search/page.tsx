import { Suspense } from "react";
import type { Metadata } from "next";
import { MovieGridSkeleton } from "@/components/movie-grid";
import { SearchResults } from "@/components/search-results";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<MovieGridSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
