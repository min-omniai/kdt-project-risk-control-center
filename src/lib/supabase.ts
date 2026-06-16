import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://ugcyrzknelyvvzovzpqh.supabase.co";
const fallbackSupabasePublishableKey = "sb_publishable_5YEuryV-rbNJrMGtGQj0Hw_e5gOM9o2";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || fallbackSupabaseUrl;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || fallbackSupabasePublishableKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
