// GET /api/products
// Devuelve el listado completo (con fallback al mock si Supabase falla).

import { NextResponse } from "next/server";
import { findAllProducts } from "@/lib/db/products";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function GET(request) {
  try {
    const products = await findAllProducts();
    return NextResponse.json(
      { products },
      {
        status: 200,
        headers: corsHeaders(request.headers.get("origin")),
      }
    );
  } catch (e) {
    console.error("[api/products] error:", e?.message);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos." },
      {
        status: 500,
        headers: corsHeaders(request.headers.get("origin")),
      }
    );
  }
}
