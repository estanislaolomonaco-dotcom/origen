// GET /api/categories
// Devuelve las categorías únicas del catálogo.

import { NextResponse } from "next/server";
import { findAllCategories } from "@/lib/db/products";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function GET(request) {
  try {
    const categories = await findAllCategories();
    return NextResponse.json(
      { categories },
      {
        status: 200,
        headers: corsHeaders(request.headers.get("origin")),
      }
    );
  } catch (e) {
    console.error("[api/categories] error:", e?.message);
    return NextResponse.json(
      { error: "No se pudieron cargar las categorías." },
      {
        status: 500,
        headers: corsHeaders(request.headers.get("origin")),
      }
    );
  }
}
