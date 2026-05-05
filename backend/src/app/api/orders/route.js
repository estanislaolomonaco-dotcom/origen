// POST /api/orders
// Recibe los datos del checkout y crea la orden vía la capa de datos.

import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db/orders";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function POST(request) {
  const headers = corsHeaders(request.headers.get("origin"));

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body invalido (JSON esperado)." },
      { status: 400, headers }
    );
  }

  const { customer, items, total } = body || {};

  if (!customer || !customer.name || !customer.email || !customer.address) {
    return NextResponse.json(
      { error: "Faltan datos del comprador." },
      { status: 400, headers }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "El carrito esta vacio." },
      { status: 400, headers }
    );
  }
  if (typeof total !== "number" || total < 0) {
    return NextResponse.json(
      { error: "Total invalido." },
      { status: 400, headers }
    );
  }

  try {
    const result = await createOrder({ customer, items, total });
    return NextResponse.json(result, { status: 201, headers });
  } catch (e) {
    console.error("[api/orders] error:", e?.message);
    return NextResponse.json(
      { error: "No se pudo crear la orden." },
      { status: 500, headers }
    );
  }
}
