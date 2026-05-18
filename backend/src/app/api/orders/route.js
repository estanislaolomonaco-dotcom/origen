// POST /api/orders
//
// Flujo completo de venta. Requiere Authorization: Bearer <access_token>
// del usuario logueado. Toda la lógica (validar stock, calcular total,
// crear orden, descontar stock, vaciar carrito) se hace en la función
// Postgres public.checkout() en una sola transacción.

import { NextResponse } from "next/server";
import { createOrderForUser } from "@/lib/db/orders";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleOptions(request);
}

function extractBearer(request) {
  const auth = request.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export async function POST(request) {
  const headers = corsHeaders(request.headers.get("origin"));

  // 1) Validar autenticación
  const accessToken = extractBearer(request);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Tenés que iniciar sesión para comprar.", code: "AUTH_REQUIRED" },
      { status: 401, headers }
    );
  }

  // 2) Parsear body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido (JSON esperado)." },
      { status: 400, headers }
    );
  }

  const { customer, items } = body || {};

  if (!customer || !customer.name || !customer.email || !customer.address) {
    return NextResponse.json(
      { error: "Faltan datos del comprador." },
      { status: 400, headers }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "El carrito está vacío." },
      { status: 400, headers }
    );
  }

  // 3) Ejecutar checkout atómico (auth + stock + total + orden + stock-- )
  try {
    const result = await createOrderForUser(accessToken, { customer, items });
    // El frontend, ante 201, debe vaciar el carrito.
    return NextResponse.json(result, { status: 201, headers });
  } catch (e) {
    const status = e.code === "AUTH_REQUIRED" ? 401 : 400;
    console.error("[api/orders] error:", e?.message);
    return NextResponse.json(
      { error: e.message || "No se pudo crear la orden.", code: e.code },
      { status, headers }
    );
  }
}
