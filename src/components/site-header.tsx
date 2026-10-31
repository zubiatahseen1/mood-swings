"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, LogOut, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const { user, isPending } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  async function logOut() {
    await getSupabaseBrowserClient().auth.signOut();
    queryClient.removeQueries({ queryKey: ["watchlist"] });
    queryClient.removeQueries({ queryKey: ["picks"] });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4 sm:gap-4">
        <Link href="/" className="font-display text-lg font-bold whitespace-nowrap">
          Mood<span className="text-mood">Swings</span>
        </Link>

        <form onSubmit={onSearch} role="search" className="ml-auto flex max-w-xs min-w-0 flex-1 gap-2">
          <label htmlFor="site-search" className="sr-only">
            Search films
          </label>
          <Input
            id="site-search"
            type="search"
            placeholder="Search a title…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit" variant="secondary" size="icon" aria-label="Search">
            <Search />
          </Button>
        </form>

        {isPending ? (
          <div className="size-9" aria-hidden="true" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-muted-foreground">
                {(user.user_metadata?.name as string | undefined) || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/watchlist">
                  <Bookmark /> Watchlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logOut}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
