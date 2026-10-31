import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mood Swings — Movies for how you want to feel",
    template: "%s — Mood Swings",
  },
  description:
    "Pick a mood, get films that match it. Save a watchlist, and the picks learn from what you actually watch.",
};

export const viewport: Viewport = {
  themeColor: "#14121c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-svh flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
            {children}
          </main>
          <footer className="border-t py-6 text-center text-xs text-muted-foreground">
            Film data from{" "}
            <a href="https://www.themoviedb.org" className="underline underline-offset-2" target="_blank" rel="noreferrer">
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
