// POST /api/payments/mercadopago/webhook
//
// MP llama a esta URL cuando hay un evento de pago.
// Reglas críticas:
//   1. Validar firma con MP_WEBHOOK_SECRET (header x-signature).
//   2. NUNCA confiar en el payload: re-consultar el pago a la API de MP.
//   3. Idempotencia: misma notificación dos veces no duplica efectos.
//   4. Responder 200 rápido (MP reintenta si tarda o falla).
//
// TODO: si el procesamiento crece (mails, inventario, fulfillment), mover a
// una cola (BullMQ / Supabase pg_cron / Inngest) y aquí sólo encolar.

import { NextResponse } from "next/server";
import {
  fetchPayment,
  verifyWebhookSignature,
  isMercadoPagoConfigured,
} from "@/lib/mercadopago";
import {
  updateOrderPayment,
  mapMpStatusToOrderStatus,
} from "@/lib/db/orders";

export async function POST(request) {
  // En webhooks NO usamos CORS (es server-to-server desde MP).

  if (!isMercadoPagoConfigured()) {
    // Devolvemos 200 igual: si MP no está configurado, no queremos que MP
    // reintente eternamente. Sólo logueamos.
    console.warn("[mp-webhook] MP no configurado; ignorando notificación.");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const url = new URL(request.url);
  // MP envía el id del recurso por query (?data.id=...&type=payment) y/o body.
  const queryDataId =
    url.searchParams.get("data.id") || url.searchParams.get("id");
  const type = url.searchParams.get("type") || url.searchParams.get("topic");

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    // Algunas notificaciones (IPN viejo) llegan sin body.
    payload = {};
  }

  const dataId = payload?.data?.id || queryDataId;
  const eventType = payload?.type || type;

  // Sólo nos interesa el tópico de payments. Para otros (merchant_order, etc.)
  // respondemos 200 sin hacer nada.
  if (eventType && eventType !== "payment") {
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  if (!dataId) {
    return NextResponse.json(
      { error: "Falta data.id en la notificación." },
      { status: 400 }
    );
  }

  // 1) Validar firma.
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    const valid = verifyWebhookSignature({
      xSignature,
      xRequestId,
      dataId,
      secret,
    });
    if (!valid) {
      console.warn("[mp-webhook] firma inválida");
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }
  } else {
    // En dev sin secret configurado, dejamos pasar pero avisamos.
    console.warn("[mp-webhook] MP_WEBHOOK_SECRET no configurado — saltando verificación.");
  }

  // 2) Re-consultar el pago a la API de MP (jamás confiar en el body).
  let payment;
  try {
    payment = await fetchPayment(dataId);
  } catch (e) {
    console.error("[mp-webhook] error consultando pago:", e?.message);
    // 500 para que MP reintente.
    return NextResponse.json(
      { error: "Error consultando pago." },
      { status: 500 }
    );
  }

  const orderCode = payment?.external_reference;
  const mpStatus = payment?.status;

  if (!orderCode) {
    console.warn("[mp-webhook] pago sin external_reference:", payment?.id);
    return NextResponse.json({ ok: true, skipped: "no-external-ref" });
  }

  // 3) Actualizar orden de forma idempotente.
  try {
    const result = await updateOrderPayment({
      orderCode,
      paymentId: payment.id,
      paymentStatus: mpStatus,
      status: mapMpStatusToOrderStatus(mpStatus),
      rawResponse: payment,
    });

    if (result.alreadyProcessed) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // TODO: efectos post-pago (mail al cliente, decremento de stock, etc.)
    // mover a cola/cron una vez crezcan.

    return NextResponse.json({ ok: true, orderCode, status: mpStatus });
  } catch (e) {
    console.error("[mp-webhook] error actualizando orden:", e?.message);
    return NextResponse.json(
      { error: "Error actualizando orden." },
      { status: 500 }
    );
  }
}
