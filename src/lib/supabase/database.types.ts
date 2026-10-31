/**
 * Types for the tables in supabase/migrations. With the Supabase CLI you can
 * regenerate this file: npx supabase gen types typescript --linked
 */
export interface Database {
  public: {
    Tables: {
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          title: string;
          poster_path: string | null;
          release_year: string | null;
          vote_average: number | null;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          tmdb_id: number;
          title: string;
          poster_path?: string | null;
          release_year?: string | null;
          vote_average?: number | null;
        };
        Update: never;
        Relationships: [];
      };
      picks: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          title: string;
          mood: string;
          genre_ids: number[];
          created_at: string;
        };
        Insert: {
          user_id?: string;
          tmdb_id: number;
          title: string;
          mood: string;
          genre_ids?: number[];
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type WatchlistRow = Database["public"]["Tables"]["watchlist"]["Row"];
export type PickRow = Database["public"]["Tables"]["picks"]["Row"];
