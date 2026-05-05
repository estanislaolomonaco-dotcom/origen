"use client";

import { createClient } from "@supabase/supabase-js";

// Cliente para Client Components (browser).
// Usa la anon key — segura para exponer al cliente porque las RLS policies
// controlan qué puede hacer cada visitante.

let browserClient = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  browserClient = createClient(url, key);
  return browserClient;
}

export function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
