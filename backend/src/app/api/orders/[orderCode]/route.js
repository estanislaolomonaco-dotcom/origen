// GET /api/orders/:orderCode
// Devuelve el estado real de una orden. Lo usan las páginas de retorno
// (/checkout/success|failure|pending) para NO confiar en los query params
// que vienen de MP en el redirect.

import { NextResponse } from "next/server";
import { corsHeaders, handleOptions } from "@/lib/cors";
import { getOrderByCode } from "@/lib/db/orders";

export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function GET(request, { params }) {
  const headers = corsHeaders(request.headers.get("origin"));
  const { orderCode } = params;

  if (!orderCode) {
    return NextResponse.json(
      { error: "orderCode requerido." },
      { status: 400, headers }
    );
  }

  const order = await getOrderByCode(orderCode);
  if (!order) {
    return NextResponse.json(
      { error: "Orden no encontrada." },
      { status: 404, headers }
    );
  }

  // No exponemos payment_raw_response — es de auditoría interna.
  return NextResponse.json(
    {
      orderId: order.order_code,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentProvider: order.payment_provider,
      total: order.total,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
      },
      items: order.items,
      createdAt: order.created_at,
    },
    { headers }
  );
}
