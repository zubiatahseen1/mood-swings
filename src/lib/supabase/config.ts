export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until the Supabase env vars are set; accounts are hidden until then. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
