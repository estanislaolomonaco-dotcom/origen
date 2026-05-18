// Cliente Supabase para Server Components, Server Actions y Route Handlers.
// Lee/escribe cookies del request para mantener la sesión sincronizada.
//
// Uso:
//   import { cookies } from "next/headers";
//   import { createClient } from "@/utils/supabase/server";
//
//   const cookieStore = await cookies();
//   const supabase = createClient(cookieStore);
//
// Nota: usar este cliente en una página la convierte en dinámica (no SSG).
// Para queries públicas en build-time (ej: catálogo prerenderizado), usar
// el cliente sin cookies de @/lib/supabase/server.

import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component: las cookies son read-only.
          // El middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
};
