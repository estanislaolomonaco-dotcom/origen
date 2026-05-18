import { createClient } from "@supabase/supabase-js";

// Cliente para Server Components, Server Actions y API Routes.
// Usa la anon key — RLS controla los permisos.
// Para tareas de admin (bypass RLS), se podria usar SUPABASE_SERVICE_ROLE_KEY
// pero por ahora no la necesitamos.

let serverClient = null;

export function getSupabaseServerClient() {
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  serverClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return serverClient;
}

export function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

// Cliente por-request que hereda la sesión del usuario via Authorization: Bearer.
// Necesario para que auth.uid() funcione dentro de funciones SECURITY DEFINER
// (la función checkout() depende de auth.uid()).
export function getSupabaseUserClient(accessToken) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !accessToken) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
