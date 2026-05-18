// GET /api/products/[id]
// Devuelve un producto + sus relacionados.

import { NextResponse } from "next/server";
import {
  findProductById,
  findRelatedProducts,
} from "@/lib/db/products";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function GET(request, { params }) {
  try {
    const product = await findProductById(params.id);

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        {
          status: 404,
          headers: corsHeaders(request.headers.get("origin")),
        }
      );
    }

    const related = await findRelatedProducts(
      product.id,
      product.category,
      4
    );

    return NextResponse.json(
      { product, related },
      {
        status: 200,
        headers: corsHeaders(request.headers.get("origin")),
      }
    );
  } catch (e) {
    console.error("[api/products/[id]] error:", e?.message);
    return NextResponse.json(
      { error: "No se pudo cargar el producto." },
      {
        status: 500,
        headers: corsHeaders(request.headers.get("origin")),
      }
    );
  }
}
