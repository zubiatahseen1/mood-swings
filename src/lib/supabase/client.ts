import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";
import type { Database } from "./database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** One Supabase client for the whole browser session. */
export function getSupabaseBrowserClient() {
  client ??= createBrowserClient<Database>(supabaseUrl, supabaseKey);
  return client;
}
