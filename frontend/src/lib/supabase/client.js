import { createBrowserClient } from "@supabase/ssr";

// Aceptamos ambos nombres: PUBLISHABLE_KEY (el del .env.example y Vercel)
// y ANON_KEY (legacy). Evita que falle el build si la env var quedó nombrada
// de cualquiera de las dos formas.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
