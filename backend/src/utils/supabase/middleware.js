// Helper de Supabase para Next.js Middleware.
// Se llama en src/middleware.js para refrescar la sesión en cada request,
// asegurando que las cookies del usuario estén actualizadas.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  // Si las env vars no están configuradas, no hacemos nada (la app sigue
  // andando con el mock data del fallback).
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refrescar la sesión (si hay)
  await supabase.auth.getUser();

  return supabaseResponse;
};
