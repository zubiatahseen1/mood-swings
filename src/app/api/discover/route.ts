import { STATUS_FOR_KIND, kindOf } from "@/lib/errors";
import type { MoodKey, RuntimeKey } from "@/lib/moods";
import { discoverQuerySchema } from "@/lib/schemas";
import { getDiscoverPage } from "@/lib/tmdb";
import { toMovie, type MoviePage } from "@/lib/types";


const PAGES_PER_BATCH = 3;
const MAX_PAGE = 20;

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = discoverQuerySchema.safeParse(query);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const { mood, runtime, batch } = parsed.data;
  const first = batch * PAGES_PER_BATCH + 1;

  try {
    const pages = await Promise.all(
      Array.from({ length: PAGES_PER_BATCH }, (_, i) =>
        getDiscoverPage(mood as MoodKey, runtime as RuntimeKey, first + i),
      ),
    );

    const totalPages = Math.min(pages[0]?.total_pages ?? 1, MAX_PAGE);
    const body: MoviePage = {
      movies: pages
        .flatMap((page) => page.results)
        .filter((movie) => movie.poster_path)
        .map(toMovie),
      page: batch,
      totalPages: Math.ceil(totalPages / PAGES_PER_BATCH),
    };
    return Response.json(body);
  } catch (error) {
    const kind = kindOf(error);
    return Response.json({ error: kind }, { status: STATUS_FOR_KIND[kind] });
  }
}
