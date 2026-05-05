// Helper de CORS para los endpoints de la API.
// El frontend está en otro origin (otra URL en Vercel).
//
// FRONTEND_URL puede ser una URL específica (producción) o "*" (dev).
// En producción se recomienda fijar la URL exacta del frontend.

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:3000,https://musictrack.vercel.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function corsHeaders(origin) {
  const allow =
    ALLOWED_ORIGINS.includes("*") || (origin && ALLOWED_ORIGINS.includes(origin))
      ? origin || "*"
      : ALLOWED_ORIGINS[0] || "*";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

// Maneja el preflight OPTIONS automáticamente.
export function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}
