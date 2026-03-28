import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  youtube_channel_id: string | null;
  youtube_channel_name: string | null;
  youtube_channel_thumbnail: string | null;
  youtube_channel_url: string | null;
  created_at: string;
  updated_at: string;
}
