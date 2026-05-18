// POST /api/payments/mercadopago/create-preference
//
// Flujo:
//   1. Recibe items + datos del comprador (+ opcionalmente orderId existente).
//   2. Valida items/precios/stock contra la BD (anti-tampering).
//   3. Crea o reutiliza una orden en estado "pending".
//   4. Crea la Preference en MP y guarda el preference_id.
//   5. Devuelve { orderId, preferenceId, initPoint }.

import { NextResponse } from "next/server";
import { corsHeaders, handleOptions } from "@/lib/cors";
import {
  createOrder,
  validateOrderItemsAgainstDb,
  updateOrderPayment,
  getOrderByCode,
} from "@/lib/db/orders";
import {
  createPreference,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";

export async function OPTIONS(request) {
  return handleOptions(request);
}

export async function POST(request) {
  const headers = corsHeaders(request.headers.get("origin"));

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      { error: "Mercado Pago no está configurado en el backend." },
      { status: 503, headers }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido (JSON esperado)." },
      { status: 400, headers }
    );
  }

  const { customer, items, orderId } = body || {};

  if (!customer?.name || !customer?.email || !customer?.address) {
    return NextResponse.json(
      { error: "Faltan datos del comprador." },
      { status: 400, headers }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Items vacíos." },
      { status: 400, headers }
    );
  }

  try {
    // 1) Validar items + precios + stock contra la BD.
    const { items: validatedItems, total } =
      await validateOrderItemsAgainstDb(items);

    // 2) Crear la orden (o reutilizar si ya nos mandaron un orderId).
    let orderCode = orderId;
    if (orderCode) {
      const existing = await getOrderByCode(orderCode);
      if (!existing) {
        return NextResponse.json(
          { error: "Orden no encontrada." },
          { status: 404, headers }
        );
      }
    } else {
      const created = await createOrder({
        customer,
        items: validatedItems,
        total,
      });
      orderCode = created.orderId;
    }

    // 3) Crear preference en MP.
    const preference = await createPreference({
      orderCode,
      items: validatedItems.map((it) => ({
        id: it.id,
        title: it.name,
        quantity: it.quantity,
        unit_price: it.price,
      })),
      payer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    });

    // 4) Guardar el preference_id en la orden (no falla el flujo si no hay DB).
    try {
      await updateOrderPayment({
        orderCode,
        preferenceId: preference.id,
      });
    } catch (e) {
      console.warn("[create-preference] no se pudo guardar preference_id:", e.message);
    }

    // En sandbox usar sandbox_init_point; en prod, init_point.
    // El SDK devuelve ambos; el cliente decide cuál.
    return NextResponse.json(
      {
        orderId: orderCode,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      },
      { status: 201, headers }
    );
  } catch (e) {
    // No loguear el access token ni datos sensibles. e.message puede contener
    // detalles de MP — está OK; el token vive sólo en env.
    console.error("[create-preference] error:", e?.message);
    return NextResponse.json(
      { error: e?.message || "No se pudo crear la preferencia." },
      { status: 500, headers }
    );
  }
}
