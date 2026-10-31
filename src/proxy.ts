import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static files, images and the API routes (which never need the session).
  matcher: ["/((?!_next/static|_next/image|api/|favicon.ico|moods/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
