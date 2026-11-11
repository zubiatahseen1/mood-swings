import { STATUS_FOR_KIND, kindOf } from "@/lib/errors";
import { searchQuerySchema } from "@/lib/schemas";
import { searchMovies } from "@/lib/tmdb";
import { toMovie, type MoviePage } from "@/lib/types";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  try {
    const page = await searchMovies(parsed.data.q, parsed.data.page);
    const body: MoviePage = {
      movies: page.results.map(toMovie),
      page: page.page,
      totalPages: page.total_pages,
    };
    return Response.json(body);
  } catch (error) {
    const kind = kindOf(error);
    return Response.json({ error: kind }, { status: STATUS_FOR_KIND[kind] });
  }
}
