// Next.js Middleware
// Corre en cada request para mantener la sesión de Supabase fresca.
// Skipea archivos estáticos para no agregar latencia innecesaria.

import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Matchea todas las rutas EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos en /products/ (assets)
     * - archivos con extensión (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|products/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
